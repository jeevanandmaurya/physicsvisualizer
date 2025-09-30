// Import unified prompt file as raw text using Vite's ?raw import
import agentPromptRaw from './prompts/agentPrompt.txt?raw';
import ScenePatcher from '../scene/patcher';

// Gemini AI Manager for Physics Chat Integration
class GeminiAIManager {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.prompt = agentPromptRaw;
    this.isInitialized = false;
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
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
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

    if (!this.scenePatcher) {
      this.scenePatcher = new ScenePatcher();
    }

    const result = this.scenePatcher.applyPatches(scene, patches);

    if (result.success) {
      console.log(`✅ Successfully applied ${result.appliedPatches}/${result.totalPatches} patches`);
      return result.scene;
    } else {
      console.error('❌ Failed to apply scene patches:', result.error);
      return scene; // Return original scene on failure
    }
  }

  // Parse AI response to determine type and extract content
  parseAIResponse(response, sceneContext) {
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
              const patchResult = this.applyScenePatches(sceneContext, parsedResponse.patches);
              if (patchResult.success) {
                updatedScene = patchResult.scene;
              } else {
                console.error('❌ Failed to apply scene patches:', patchResult.error);
              }
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
