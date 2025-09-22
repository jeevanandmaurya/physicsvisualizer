// Import prompt files as raw text using Vite's ?raw import
import agentPromptRaw from './prompts/agentPrompt.txt?raw';
import extractPromptRaw from './prompts/extractPrompt.txt?raw';
import ScenePatcher from '../scene/patcher';

// Gemini AI Manager for Physics Chat Integration
class GeminiAIManager {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.agentPrompt = agentPromptRaw;
    this.extractPrompt = extractPromptRaw;
    this.isInitialized = false;
  }

  // Initialize prompts (no longer async since we import directly)
  async initialize() {
    if (this.isInitialized) return;

    // Prompts are already loaded via imports, just mark as initialized
    this.isInitialized = true;
    console.log('Gemini AI Manager initialized successfully');
  }



  // Generate scene from conversation
  async generateSceneFromChat(conversationText) {
    await this.initialize();

    const prompt = this.extractPrompt.replace('${conversationText}', conversationText);
    const response = await this.callGeminiAPI(prompt);

    // Parse the JSON response
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse AI-generated scene:', error);
      throw new Error('AI returned invalid scene format');
    }
  }

  // Call Gemini API
  async callGeminiAPI(prompt) {
    if (!this.apiKey) {
      throw new Error('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your environment variables.');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.apiKey}`,
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
      throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
  }

  // Parse AI response for scene modifications
  parseAIResponse(response) {
    console.log('🤖 AI Response Received:', response);

    // Look for scene modification instructions in the response
    const sceneModifications = this.extractSceneModifications(response);

    console.log('🔍 Extracted Scene Modifications:', sceneModifications);
    console.log('📊 Modification Count:', sceneModifications.length);

    return {
      text: response,
      sceneModifications,
      metadata: {
        timestamp: new Date().toISOString(),
        hasModifications: sceneModifications.length > 0
      }
    };
  }

  // Extract scene modifications from AI response
  extractSceneModifications(response) {
    console.log('🔍 Starting scene modification extraction...');
    const modifications = [];

    // Enhanced patterns to match the new AI format
    const patterns = [
      // Primary patterns from new prompt format
      /set\s+([^\s,]+)\s+to\s+([^,\n]+)/gi,
      /change\s+([^\s,]+)\s+to\s+([^,\n]+)/gi,
      /update\s+([^\s,]+)\s+to\s+([^,\n]+)/gi,

      // Movement patterns
      /move\s+([^\s]+)\s+to\s+(?:position\s+)?([^\n]+)/gi,
      /position\s+([^\s]+)\s+(?:to|at)\s+([^\n]+)/gi,

      // Specific property patterns
      /mass\s+of\s+([^\s]+)\s+(?:to|is)\s+([^\n]+)/gi,
      /velocity\s+of\s+([^\s]+)\s+(?:to|is)\s+([^\n]+)/gi,

      // Additional patterns for robustness
      /([^\s]+\.[^\s]+)\s*=\s*([^,\n]+)/gi,
      /([^\s]+\.[^\s]+\.[^\s]+)\s*=\s*([^,\n]+)/gi,
    ];

    console.log('🔎 Testing regex patterns...');
    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      let match;
      let patternMatches = 0;

      while ((match = pattern.exec(response)) !== null) {
        patternMatches++;
        const [, propertyPath, valueStr] = match;
        console.log(`🎯 Pattern ${i} match: "${propertyPath}" = "${valueStr}"`);

        const parsedValue = this.parseValue(valueStr.trim());
        console.log(`🔢 Parsed value:`, parsedValue);

        if (parsedValue !== null) {
          const normalizedPath = this.normalizePropertyPath(propertyPath);
          console.log(`📝 Normalized path: "${normalizedPath}"`);

          modifications.push({
            propertyPath: normalizedPath,
            value: parsedValue,
            reason: `AI modification from user request`
          });

          console.log(`✅ Added modification: ${normalizedPath} = ${JSON.stringify(parsedValue)}`);
        } else {
          console.log(`❌ Failed to parse value: "${valueStr}"`);
        }
      }

      if (patternMatches > 0) {
        console.log(`📊 Pattern ${i} found ${patternMatches} matches`);
      }
    }

    // Also look for comma-separated modifications in the same sentence
    console.log('🔗 Checking for comma-separated modifications...');

    // Split by commas and "and" but handle arrays carefully
    const parts = response.split(/(?:,|\sand\s)/).map(part => part.trim());
    console.log('🔗 Response parts:', parts);

    for (let i = 0; i < parts.length; i++) {
      let part = parts[i];

      // Handle array values that might be split across parts
      if (part.includes('[') && !part.includes(']')) {
        // This part starts an array, collect until we find the closing bracket
        let arrayParts = [part];
        for (let j = i + 1; j < parts.length; j++) {
          arrayParts.push(parts[j]);
          if (parts[j].includes(']')) {
            // Found the end of the array
            part = arrayParts.join(', ');
            i = j; // Skip the parts we consumed
            break;
          }
        }
      }

      // Look for "property to value" pattern in each part
      const match = part.match(/([a-zA-Z.\s]+?)\s+to\s+(.+)/);
      if (match) {
        const [, propertyPath, valueStr] = match;
        const trimmedPath = propertyPath.trim();
        const trimmedValue = valueStr.trim();

        console.log(`🔗 Found in part "${part}": property="${trimmedPath}", value="${trimmedValue}"`);

        // Skip invalid property paths (like sentences that accidentally match)
        if (trimmedPath.includes(' ') && !trimmedPath.includes('.')) {
          console.log(`❌ Skipping invalid property path: "${trimmedPath}"`);
          continue;
        }

        const parsedValue = this.parseValue(trimmedValue);
        if (parsedValue !== null) {
          const normalizedPath = this.normalizePropertyPath(trimmedPath);
          modifications.push({
            propertyPath: normalizedPath,
            value: parsedValue,
            reason: `AI modification from user request`
          });
          console.log(`✅ Added comma-separated modification: ${normalizedPath} = ${JSON.stringify(parsedValue)}`);
        }
      }
    }

    console.log('📋 Final modifications extracted:', modifications.length);
    modifications.forEach((mod, index) => {
      console.log(`  ${index + 1}. ${mod.propertyPath} = ${JSON.stringify(mod.value)}`);
    });

    return modifications;
  }

  // Parse value strings into appropriate types
  parseValue(valueStr) {
    console.log(`🔢 Parsing value: "${valueStr}"`);

    // Clean up the value string first
    let cleanValue = valueStr.trim();

    // Remove surrounding quotes if present
    if ((cleanValue.startsWith('"') && cleanValue.endsWith('"')) ||
        (cleanValue.startsWith("'") && cleanValue.endsWith("'"))) {
      cleanValue = cleanValue.slice(1, -1);
      console.log(`🧹 Removed quotes: "${cleanValue}"`);
    }

    // Try to parse as JSON first (for arrays/objects)
    try {
      const jsonValue = JSON.parse(cleanValue);
      console.log(`📄 Parsed as JSON:`, jsonValue);
      return jsonValue;
    } catch {
      console.log(`❌ Not valid JSON, trying other formats...`);
    }

    // Handle numeric values
    if (!isNaN(cleanValue) && !isNaN(parseFloat(cleanValue))) {
      const numValue = parseFloat(cleanValue);
      console.log(`🔢 Parsed as number:`, numValue);
      return numValue;
    }

    // Handle boolean values
    if (cleanValue.toLowerCase() === 'true') {
      console.log(`🔢 Parsed as boolean: true`);
      return true;
    }
    if (cleanValue.toLowerCase() === 'false') {
      console.log(`🔢 Parsed as boolean: false`);
      return false;
    }

    // Handle array-like strings like "[1, 2, 3]" or "1, 2, 3"
    const arrayMatch = cleanValue.match(/^\[([^\]]+)\]$/);
    if (arrayMatch) {
      const arrayContent = arrayMatch[1];
      console.log(`📊 Found array string: "${arrayContent}"`);
      const numbers = arrayContent.split(',').map(s => {
        const num = parseFloat(s.trim());
        return isNaN(num) ? s.trim() : num;
      });
      if (numbers.length > 0) {
        console.log(`🔢 Parsed as array:`, numbers);
        return numbers;
      }
    }

    // Return as string if nothing else matches
    console.log(`📝 Returning as string: "${cleanValue}"`);
    return cleanValue;
  }

  // Normalize property paths to standard format
  normalizePropertyPath(path) {
    console.log(`📝 Normalizing property path: "${path}"`);

    let normalizedPath = path.toLowerCase();
    console.log(`🔤 Lowercased: "${normalizedPath}"`);

    // Handle object references - avoid double prefixing
    if (normalizedPath.startsWith('object.')) {
      // Already has object prefix, just return as-is
      console.log(`✅ Already normalized: "${normalizedPath}"`);
      return normalizedPath;
    }

    // Convert natural language to property paths
    const mappings = {
      // Object references (only apply if not already prefixed)
      'the ball': 'object.ball',
      'ball': 'object.ball',
      'sphere': 'object.sphere',
      'box': 'object.box',
      'cylinder': 'object.cylinder',

      // Scene properties
      'gravity': 'scene.gravity',
      'ground': 'scene.hasGround',
      'friction': 'scene.contactMaterial.friction',
      'restitution': 'scene.contactMaterial.restitution',

      // Common property mappings
      'position': 'position',
      'velocity': 'velocity',
      'mass': 'mass',
      'color': 'color'
    };

    // Apply mappings
    let mappingsApplied = 0;
    for (const [key, value] of Object.entries(mappings)) {
      const before = normalizedPath;
      normalizedPath = normalizedPath.replace(new RegExp(`\\b${key}\\b`, 'g'), value);
      if (before !== normalizedPath) {
        console.log(`🔄 Applied mapping: "${key}" → "${value}"`);
        mappingsApplied++;
      }
    }

    if (mappingsApplied > 0) {
      console.log(`📊 Applied ${mappingsApplied} mappings`);
    }

    // Handle compound paths like "ball position" -> "object.ball.position"
    if (normalizedPath.includes(' ') && !normalizedPath.includes('.')) {
      const parts = normalizedPath.split(' ');
      if (parts.length === 2) {
        const [object, property] = parts;
        const compoundPath = `${object}.${property}`;
        console.log(`🔗 Converted compound path: "${normalizedPath}" → "${compoundPath}"`);
        return compoundPath;
      }
    }

    console.log(`✅ Final normalized path: "${normalizedPath}"`);
    return normalizedPath;
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

    console.log(`📋 Total patches extracted: ${allPatches.length}`);
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

  // Enhanced processUserMessage with JSON patch support
  async processUserMessage(message, chatContext, sceneContext) {
    await this.initialize();

    const prompt = `${this.agentPrompt}

CHAT CONTEXT:
${JSON.stringify(chatContext, null, 2)}

CURRENT SCENE STATE:
${JSON.stringify(sceneContext, null, 2)}

USER MESSAGE: ${message}

Please respond as the Physics AI Agent, considering the current scene state and chat history. If you need to modify the scene, provide specific JSON patch operations in a code block.`;

    const response = await this.callGeminiAPI(prompt);
    const patches = this.extractJSONPatches(response);
    const updatedScene = this.applyScenePatches(sceneContext, patches);

    return {
      text: response.replace(/```json[\s\S]*?```/g, '').trim(),
      sceneModifications: patches,
      updatedScene: updatedScene,
      metadata: {
        timestamp: new Date().toISOString(),
        hasModifications: patches.length > 0,
        modificationCount: patches.length
      }
    };
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
