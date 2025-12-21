// Import unified prompt file as raw text using Vite's ?raw import
import agentPromptRaw from './prompts/agentPrompt.txt?raw';
import ScenePatcher from '../scene/patcher';
import { toolRegistry } from '../tools';

// Gemini AI Manager for Physics Chat Integration
class GeminiAIManager {
  private apiKey: string | undefined;
  private prompt: string;
  private isInitialized: boolean;
  private scenePatcher: ScenePatcher | null;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.prompt = agentPromptRaw;
    this.isInitialized = false;
    this.scenePatcher = null;
  }

  // Initialize prompts (no longer async since we import directly)
  async initialize() {
    if (this.isInitialized) return;

    // Prompts are already loaded via imports, just mark as initialized
    this.isInitialized = true;
    console.log('Gemini AI Manager initialized successfully');
  }


  // Call Gemini API with retry logic for transient errors
  async callGeminiAPI(prompt, maxRetries = 3) {
    if (!this.apiKey) {
      throw new Error('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your environment variables.');
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
              }
            })
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          const errorMsg = errorData.error?.message || 'Unknown error';
          const status = response.status;

          // Retry on transient errors (5xx, rate limits)
          if ((status >= 500 && status < 600) || status === 429) {
            if (attempt < maxRetries) {
              const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
              console.warn(`Gemini API error ${status} (attempt ${attempt}/${maxRetries}): ${errorMsg}. Retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          }

          throw new Error(`Gemini API error: ${status} - ${errorMsg}`);
        }

        const data = await response.json();

        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
          throw new Error('Invalid response from Gemini API');
        }

        return data.candidates[0].content.parts[0].text;
      } catch (error) {
        if (attempt === maxRetries) {
          throw error; // Re-throw on final failure
        }
        // For non-network errors, don't retry
        if (!error.message.includes('503') && !error.message.includes('overloaded') && !error.message.includes('429')) {
          throw error;
        }
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`Transient error (attempt ${attempt}/${maxRetries}): ${error.message}. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }





  // Extract JSON patches from AI response
  extractJSONPatches(response) {
    console.log('🔍 Extracting JSON patches from response...');

    const jsonBlocks = response.match(/```json\s*(\[[\s\S]*?\])\s*```/g);
    if (!jsonBlocks) {
      console.log('❌ No JSON blocks found in response');
      return [];
    }

    const allPatches = [];
    for (const block of jsonBlocks) {
      try {
        const cleanBlock = block.replace(/```json\s*|\s*```/g, '');
        const patches = JSON.parse(cleanBlock);

        if (Array.isArray(patches)) {
          allPatches.push(...patches);
          console.log(`✅ Extracted ${patches.length} patches from block`);
        } else {
          console.warn('⚠️ JSON block is not an array:', patches);
        }
      } catch (error) {
        console.error('❌ Failed to parse JSON patch block:', error);
        console.error('Block content:', block);
      }
    }

    console.log(`� Total patches extracted: ${allPatches.length}`);
    return allPatches;
  }

  // Apply JSON patches to scene using the proper ScenePatcher
  applyScenePatches(scene, patches) {
    console.log('🔧 GeminiAIManager: Applying scene patches using ScenePatcher...');
    console.log('📥 Input scene objects:', scene?.objects?.length || 0);
    console.log('📝 Patches to apply:', patches.length);

    if (!this.scenePatcher) {
      this.scenePatcher = new ScenePatcher();
    }

    const result = this.scenePatcher.applyPatches(scene, patches);

    if (result.success) {
      console.log(`✅ Successfully applied ${result.appliedPatches}/${result.totalPatches} patches`);
      console.log('📤 Output scene objects:', result.scene?.objects?.length || 0);
      return result.scene;
    } else {
      console.error('❌ Failed to apply scene patches:', result.error);
      console.log('📤 Returning original scene with objects:', scene?.objects?.length || 0);
      return scene; // Return original scene on failure
    }
  }

  // Parse AI response to determine type and extract content
  async parseAIResponse(response, sceneContext) {
    console.log('🤖 Parsing AI Response:', response.substring(0, 200) + '...');

    // First, try to parse the entire response as structured JSON
    let cleanResponse = response.trim();

    // Check if response is wrapped in ```json blocks
    const jsonBlockMatch = cleanResponse.match(/```json\s*(\{[\s\S]*\})\s*```?/);
    if (jsonBlockMatch) {
      cleanResponse = jsonBlockMatch[1];
      console.log('📦 Extracted JSON from markdown block');
    }

    try {
      const parsedResponse = JSON.parse(cleanResponse);
      if (parsedResponse && typeof parsedResponse === 'object' && parsedResponse.type) {
        console.log(`🎯 Detected structured response - ${parsedResponse.type} mode`);

        switch (parsedResponse.type) {
          case 'tool_call':
            // Handle tool execution
            console.log(`🔧 Executing tool: ${parsedResponse.tool}`);
            try {
              const toolResult = await toolRegistry.executeTool(
                parsedResponse.tool,
                parsedResponse.parameters || {},
                { scene: sceneContext }
              );

              if (toolResult.success) {
                // Process tool result
                let updatedScene = sceneContext;
                let message = parsedResponse.message || 'Tool executed successfully';

                // Handle different tool result types
                if (toolResult.data) {
                  // If tool returned objects array, add to scene
                  if (toolResult.data.result && Array.isArray(toolResult.data.result)) {
                    const objects = toolResult.data.result;
                    message += ` Generated ${objects.length} objects.`;
                    
                    // Add objects to scene
                    const patches = objects.map(obj => ({
                      op: 'add',
                      path: '/objects/-',
                      value: obj
                    }));
                    
                    // applyScenePatches returns the scene directly
                    updatedScene = this.applyScenePatches(sceneContext, patches);
                  }
                  // If tool returned complete scene, use it
                  else if (toolResult.data.result && toolResult.data.result.id && toolResult.data.result.objects) {
                    updatedScene = toolResult.data.result;
                    message += ' Generated complete scene.';
                  }
                  // If tool returned analysis data
                  else if (toolResult.data.energy || toolResult.data.momentum) {
                    message += `\n\n**Physics Analysis:**\n`;
                    if (toolResult.data.energy) {
                      message += `- Kinetic Energy: ${toolResult.data.energy.kinetic.toFixed(3)} J\n`;
                      message += `- Potential Energy: ${toolResult.data.energy.potential.toFixed(3)} J\n`;
                      message += `- Total Energy: ${toolResult.data.energy.total.toFixed(3)} J\n`;
                    }
                    if (toolResult.data.momentum) {
                      message += `- Total Momentum: [${toolResult.data.momentum.total.map(v => v.toFixed(3)).join(', ')}]\n`;
                      message += `- Momentum Magnitude: ${toolResult.data.momentum.magnitude.toFixed(3)} kg⋅m/s\n`;
                    }
                    if (toolResult.data.centerOfMass) {
                      message += `- Center of Mass: [${toolResult.data.centerOfMass.map(v => v.toFixed(3)).join(', ')}]\n`;
                    }
                  }
                  // If tool returned HTML preview
                  else if (toolResult.data.html) {
                    message += '\n\n**Three.js Preview Generated**\nYou can save this HTML and open it in a browser.';
                    // Store HTML for potential download
                    updatedScene = {
                      ...sceneContext,
                      _htmlPreview: toolResult.data.html
                    };
                  }
                  // If workflow result
                  else if (toolResult.data.steps) {
                    const successfulSteps = toolResult.data.steps.filter((s: any) => s.success).length;
                    message += ` Completed ${successfulSteps}/${toolResult.data.steps.length} workflow steps.`;
                    if (toolResult.data.finalScene) {
                      updatedScene = toolResult.data.finalScene;
                    }
                  }
                }

                return {
                  type: 'tool_result',
                  text: message,
                  sceneModifications: [],
                  updatedScene: updatedScene,
                  toolResult: toolResult,
                  metadata: {
                    timestamp: new Date().toISOString(),
                    intent: 'tool_call',
                    hasModifications: updatedScene !== sceneContext,
                    tool: parsedResponse.tool,
                    mode: 'tool_execution'
                  }
                };
              } else {
                // Tool execution failed
                return {
                  type: 'chat',
                  text: `❌ Tool execution failed: ${toolResult.error}\n\n${parsedResponse.message || 'I tried to use a tool but encountered an error.'}`,
                  sceneModifications: [],
                  updatedScene: sceneContext,
                  metadata: {
                    timestamp: new Date().toISOString(),
                    intent: 'error',
                    hasModifications: false,
                    mode: 'tool_error'
                  }
                };
              }
            } catch (error) {
              console.error('❌ Tool execution error:', error);
              return {
                type: 'chat',
                text: `❌ Tool execution error: ${error.message}\n\n${parsedResponse.message || 'I tried to use a tool but encountered an error.'}`,
                sceneModifications: [],
                updatedScene: sceneContext,
                metadata: {
                  timestamp: new Date().toISOString(),
                  intent: 'error',
                  hasModifications: false,
                  mode: 'tool_error'
                }
              };
            }

          case 'chat':
            return {
              type: 'chat',
              text: parsedResponse.content,
              sceneModifications: [],
              updatedScene: sceneContext,
              metadata: {
                timestamp: new Date().toISOString(),
                intent: 'chat',
                hasModifications: false,
                modificationCount: 0,
                mode: 'chat'
              }
            };

          case 'create_scene':
            return {
              type: 'create',
              text: parsedResponse.message || `I've created a new physics scene based on your description.`,
              sceneModifications: [],
              updatedScene: parsedResponse.scene,
              metadata: {
                timestamp: new Date().toISOString(),
                intent: 'create',
                hasModifications: true,
                modificationCount: 0,
                mode: 'generation'
              }
            };

          case 'edit_patches':
            let updatedScene = sceneContext;
            if (parsedResponse.patches && parsedResponse.patches.length > 0) {
              // applyScenePatches returns the scene directly (or original on failure)
              updatedScene = this.applyScenePatches(sceneContext, parsedResponse.patches);
            }

            return {
              type: 'edit',
              text: parsedResponse.message,
              sceneModifications: parsedResponse.patches || [],
              updatedScene: updatedScene,
              metadata: {
                timestamp: new Date().toISOString(),
                intent: 'edit',
                hasModifications: (parsedResponse.patches && parsedResponse.patches.length > 0),
                modificationCount: (parsedResponse.patches ? parsedResponse.patches.length : 0),
                mode: 'patching'
              }
            };

          case 'analyze':
            return {
              type: 'analyze',
              text: parsedResponse.notes || 'Clarification needed before proceeding.',
              sceneModifications: [],
              updatedScene: sceneContext,
              metadata: {
                timestamp: new Date().toISOString(),
                intent: 'analyze',
                hasModifications: false,
                mode: 'analyze'
              }
            };

          default:
            console.warn('⚠️ Unknown response type:', parsedResponse.type);
          // Fall through to legacy parsing
        }
      }
    } catch (e) {
      // Not structured JSON, fall back to legacy parsing
      console.log('📝 Response not structured JSON, using legacy parsing');
    }

    // Legacy parsing for backward compatibility
    // First, try to parse as full scene JSON (create new scene)
    try {
      const jsonScene = JSON.parse(response.trim());
      if (jsonScene && typeof jsonScene === 'object' &&
        jsonScene.id && jsonScene.name && jsonScene.objects) {
        console.log('🎨 Detected full scene JSON - Create mode (legacy)');
        return {
          type: 'create',
          text: `I've created a new physics scene based on your description.`,
          sceneModifications: [],
          updatedScene: jsonScene,
          metadata: {
            timestamp: new Date().toISOString(),
            intent: 'create',
            hasModifications: true,
            modificationCount: 0,
            mode: 'generation'
          }
        };
      }
    } catch (e) {
      // Not a full scene, continue to other checks
    }

    // Check for JSON patches (edit mode)
    const patches = this.extractJSONPatches(response);
    if (patches && patches.length > 0) {
      console.log(`🔧 Detected JSON patches (${patches.length}) - Edit mode (legacy)`);
      let updatedScene = sceneContext;
      const patchResult = this.applyScenePatches(sceneContext, patches);
      if (patchResult.success) {
        updatedScene = patchResult.scene;
      } else {
        console.error('❌ Failed to apply scene patches:', patchResult.error);
      }

      return {
        type: 'edit',
        text: response.replace(/```json[\s\S]*?```/g, '').trim(),
        sceneModifications: patches,
        updatedScene: updatedScene,
        metadata: {
          timestamp: new Date().toISOString(),
          intent: 'edit',
          hasModifications: patches.length > 0,
          modificationCount: patches.length,
          mode: 'patching'
        }
      };
    }

    // Default to chat mode
    console.log('💬 No scene modifications detected - Chat mode');
    return {
      type: 'chat',
      text: response,
      sceneModifications: [],
      updatedScene: sceneContext,
      metadata: {
        timestamp: new Date().toISOString(),
        intent: 'chat',
        hasModifications: false,
        modificationCount: 0,
        mode: 'chat'
      }
    };
  }

  // Unified processUserMessage - single AI call with integrated planning
  async processUserMessage(message, chatContext, sceneContext) {
    await this.initialize();

    const prompt = `${this.prompt}

CHAT CONTEXT:
${JSON.stringify(chatContext, null, 2)}

CURRENT SCENE STATE:
${JSON.stringify(sceneContext, null, 2)}

USER MESSAGE: ${message}`;

    const response = await this.callGeminiAPI(prompt);
    const parsed = this.parseAIResponse(response, sceneContext);
    return parsed;
  }

  // Get available AI capabilities
  getCapabilities() {
    return {
      canModifyProperties: true,
      canGenerateScenes: true,
      supportsJSONPatches: true,
      supportedProperties: [
        'scene.gravity',
        'scene.hasGround',
        'scene.contactMaterial.friction',
        'scene.contactMaterial.restitution',
        'object.*.position',
        'object.*.velocity',
        'object.*.mass',
        'object.*.color',
        'object.*.radius',
        'object.*.dimensions'
      ],
      supportedOperations: [
        'set_property',
        'get_property',
        'find_objects',
        'generate_scene',
        'apply_json_patch'
      ]
    };
  }
}

export default GeminiAIManager;
