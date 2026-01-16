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
  // Local Ollama fallback (optional)
  public ollamaModel: string;
  public ollamaEndpoint: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.prompt = agentPromptRaw;
    this.isInitialized = false;
    this.scenePatcher = null;
    this.ollamaModel = import.meta.env.VITE_OLLAMA_MODEL || 'qwen2.5:3b-instruct';
    this.ollamaEndpoint = import.meta.env.VITE_OLLAMA_ENDPOINT || 'http://localhost:11434/api/generate';
  }

  // Initialize prompts 
  async initialize() {
    if (this.isInitialized) return;

    // Prompts are already loaded via imports, just mark as initialized
    this.isInitialized = true;
    
    if (this.apiKey) {
      console.log('✅ Gemini AI Manager initialized: Using Gemini (gemini-3-flash-preview)');
    } else {
      console.log(`✅ Gemini AI Manager initialized: Using Ollama fallback (${this.ollamaModel})`);
    }
  }


  // Call Gemini API with retry logic for transient errors
  // Read a response body stream into a single string (works for both JSON and SSE-like streams)
  async readResponseBodyAsString(response: Response) {
    if (!response.body) return await response.text().catch(() => '');
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let done = false;
    let accumulated = '';
    while (!done) {
      // eslint-disable-next-line no-await-in-loop
      const { value, done: chunkDone } = await reader.read();
      if (value) accumulated += decoder.decode(value, { stream: !chunkDone });
      done = !!chunkDone;
    }
    return accumulated;
  }

  // Parse common line-delimited JSON event streams (SSE / chunked JSON objects)
  parseStreamedEventPayload(accumulated: string) {
    if (!accumulated) return '';
    const lines = accumulated.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let assembled = '';

    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        // Common Ollama/qwen streaming shape: { model, response: "{...}" }
        if (parsed.response) {
          const resp = parsed.response;
          if (typeof resp === 'string') {
            // If the response is an escaped JSON string, try to unescape it and pull out content
            try {
              const inner = JSON.parse(resp);
              if (inner && typeof inner === 'object') {
                if (inner.content) assembled += (typeof inner.content === 'string' ? inner.content : JSON.stringify(inner.content));
                else assembled += JSON.stringify(inner);
              } else {
                assembled += String(resp);
              }
            } catch (e) {
              assembled += resp;
            }
          } else if (typeof resp === 'object') {
            if (resp.content) assembled += (typeof resp.content === 'string' ? resp.content : JSON.stringify(resp.content));
            else assembled += JSON.stringify(resp);
          }
          continue;
        }

        // Generic candidates/content shape
        if (parsed.candidates && parsed.candidates[0] && parsed.candidates[0].content && parsed.candidates[0].content.parts) {
          const part = parsed.candidates[0].content.parts[0];
          if (part && part.text) assembled += part.text;
          continue;
        }

        // Fallback: if there's a 'content' field
        if (parsed.content && typeof parsed.content === 'string') {
          assembled += parsed.content;
          continue;
        }
      } catch (e) {
        // Not a JSON line — append raw
        assembled += line;
      }
    }

    // If nothing assembled, return original accumulated so callers can try other parsing
    // Try to recover top-level JSON from the assembled text
    try {
      const recovered = this.recoverJSONFromText(assembled || accumulated);
      if (recovered) return JSON.stringify(recovered);
    } catch (e) {
      // ignore and return assembled
    }

    return assembled || accumulated;
  }

  // Try to extract and parse a top-level JSON object from noisy text
  recoverJSONFromText(text: string): any | null {
    if (!text) return null;
    // Remove common HTML tags (e.g., <em>, </em>) and control characters
    let cleaned = text.replace(/<[^>]+>/g, '');
    cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    // Normalize smart quotes to straight quotes
    cleaned = cleaned.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');

    // Normalize code blocks in `code` fields: convert backtick / triple-backtick blocks into JSON strings
    const escapeForJson = (s: string) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, '\\n');
    // triple-backtick fenced code: "code": ```...``` -> "code":"..."
    cleaned = cleaned.replace(/"code"\s*:\s*```([\s\S]*?)```/g, (_m, code) => `"code":"${escapeForJson(code)}"`);
    // backtick delimited code: "code": `...` -> "code":"..."
    cleaned = cleaned.replace(/"code"\s*:\s*`([\s\S]*?)`/g, (_m, code) => `"code":"${escapeForJson(code)}"`);

    // Look for the '"type"' marker and find the nearest leading '{'
    const typeIndex = cleaned.indexOf('"type"');
    const startSearchIndex = typeIndex > 0 ? typeIndex : cleaned.indexOf('{');
    if (startSearchIndex === -1) return null;

    // Find the start brace before the type key
    const braceStart = cleaned.lastIndexOf('{', startSearchIndex);
    if (braceStart === -1) return null;

    // Walk forward to balance braces
    let depth = 0;
    let endIndex = -1;
    for (let i = braceStart; i < cleaned.length; i++) {
      const ch = cleaned[i];
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          endIndex = i;
          break;
        }
      }
    }

    let candidate = endIndex > braceStart ? cleaned.slice(braceStart, endIndex + 1) : cleaned.slice(braceStart);

    // If braces not balanced, append closing braces up to a small limit
    if (candidate) {
      const openCount = (candidate.match(/{/g) || []).length;
      const closeCount = (candidate.match(/}/g) || []).length;
      if (openCount > closeCount) candidate += '}'.repeat(Math.min(8, openCount - closeCount));
    }

    try {
      return JSON.parse(candidate);
    } catch (e) {
      // As a last resort, try to find a JSON-looking substring via regex
      const jsonMatch = cleaned.match(/\{[\s\S]*\"type\"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e2) {
          return null;
        }
      }
    }

    return null;
  }

  // Resolve tool aliases to actual registered tool names
  resolveToolName(toolName: string) {
    if (!toolName) return toolName;
    const canonical = toolName.trim();
    const aliases: Record<string, string> = {
      'create_scene': 'generate_complete_scene',
      'create_scene_objects': 'generate_scene_objects',
      'create_threejs': 'create_threejs_preview',
      'apply_patches': 'apply_scene_patches',
      'analyze': 'analyze_scene_physics'
    };

    const mapped = aliases[canonical] || canonical;
    // If tool exists in registry, return it, otherwise try lowercase variant
    if (toolRegistry.getTool(mapped)) return mapped;
    if (toolRegistry.getTool(mapped.toLowerCase())) return mapped.toLowerCase();
    // Last resort: return original name so executeTool will return a helpful error
    return toolName;
  }

  // Unified AI call: prefer Gemini when API key is present; fallback to Ollama only when Gemini key is not configured
  async callGeminiAPI(prompt: string, maxRetries = 3) {
    // If no Gemini API key, use local Ollama-style endpoint as fallback
    if (!this.apiKey) {
      if (!this.ollamaEndpoint) throw new Error('Gemini API key not found and no Ollama endpoint configured.');

      console.log(`🤖 AI Request: Using Ollama (${this.ollamaModel})`);

      const ollamaPayload = {
        model: this.ollamaModel,
        prompt,
        max_tokens: 2048,
        temperature: 0.7,
      };

      const resp = await fetch(this.ollamaEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ollamaPayload),
      });

      if (!resp.ok) {
        const errText = await resp.text().catch(() => 'No body');
        throw new Error(`Ollama API error: ${resp.status} - ${errText}`);
      }

      const raw = await this.readResponseBodyAsString(resp);
      // If server streamed line-delimited JSON events, try to extract inner responses first
      const extracted = this.parseStreamedEventPayload(raw);
      try {
        const parsed = JSON.parse(extracted);
        if (typeof parsed === 'string') return parsed;
        if (parsed.output) return typeof parsed.output === 'string' ? parsed.output : JSON.stringify(parsed.output);
        if (Array.isArray(parsed.generations) && parsed.generations[0] && parsed.generations[0].text) return parsed.generations[0].text;
        if (Array.isArray(parsed.content) && parsed.content[0] && parsed.content[0].message) return parsed.content[0].message;
        return JSON.stringify(parsed);
      } catch (err) {
        // If we couldn't parse extracted JSON, return the assembled text (best-effort)
        return extracted;
      }
    }

    // Gemini path
    console.log('🚀 AI Request: Using Gemini (gemini-3-flash-preview)');
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
              contents: [
                {
                  parts: [
                    {
                      text: prompt,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
              },
            }),
          }
        );

        if (!response.ok) {
          // try to extract helpful error text
          let errText = '';
          try {
            errText = (await response.json()).error?.message || JSON.stringify(await response.text());
          } catch (e) {
            errText = await response.text().catch(() => 'No body');
          }

          const status = response.status;
          if ((status >= 500 && status < 600) || status === 429) {
            if (attempt < maxRetries) {
              const delay = Math.pow(2, attempt) * 1000;
              console.warn(`Gemini API transient error ${status} (attempt ${attempt}/${maxRetries}): ${errText}. Retrying in ${delay}ms...`);
              // eslint-disable-next-line no-await-in-loop
              await new Promise((r) => setTimeout(r, delay));
              continue;
            }
          }

          throw new Error(`Gemini API error: ${status} - ${errText}`);
        }

        const contentType = response.headers.get('content-type') || '';
        // If streaming or SSE, read full stream then parse
        if ((contentType.includes('text/event-stream') || contentType.includes('stream')) && response.body) {
          const accumulated = await this.readResponseBodyAsString(response);
          if (!accumulated.trim()) throw new Error('Empty streaming response from Gemini');
          const extracted = this.parseStreamedEventPayload(accumulated);
          try {
            const parsed = JSON.parse(extracted);
            if (parsed.candidates && parsed.candidates[0] && parsed.candidates[0].content && parsed.candidates[0].content.parts && parsed.candidates[0].content.parts[0]) {
              return parsed.candidates[0].content.parts[0].text;
            }
            return JSON.stringify(parsed);
          } catch (err) {
            return extracted;
          }
        }

        // Non-streaming: parse JSON body normally
        const data = await response.json();
        if (data.error) throw new Error(`Gemini API error: ${data.error.message || 'Unknown error'}`);
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
          return data.candidates[0].content.parts[0].text;
        }

        // Unknown shape: fallback to stringified body
        return JSON.stringify(data);
      } catch (error: any) {
        if (attempt === maxRetries) throw error;
        // Only retry on transient network/server errors
        const msg = String(error?.message || error);
        if (!msg.includes('503') && !msg.includes('overloaded') && !msg.includes('429') && !msg.includes('network')) {
          throw error;
        }
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`Transient error (attempt ${attempt}/${maxRetries}): ${msg}. Retrying in ${delay}ms...`);
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    // Should not reach here
    throw new Error('Gemini API failed after retries');
  }





  // Apply JSON patches to scene using the proper ScenePatcher
  applyScenePatches(scene, patches) {
    if (!this.scenePatcher) this.scenePatcher = new ScenePatcher();
    const result = this.scenePatcher.applyPatches(scene, patches);
    return result.success ? result.scene : scene;
  }

  // Parse AI response (simplified)
  async parseAIResponse(response: any, sceneContext: any) {
    const text = typeof response === 'string' ? response.trim() : JSON.stringify(response);
    // Try parse as JSON first
    let parsed: any = null;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      // Not JSON — return chat fallback
      return {
        type: 'chat',
        text,
        sceneModifications: [],
        updatedScene: sceneContext,
        metadata: { timestamp: new Date().toISOString(), intent: 'chat', hasModifications: false }
      };
    }

    // If structured response
    if (parsed && typeof parsed === 'object' && parsed.type) {
      if (parsed.type === 'tool_call') {
        const requestedTool = parsed.tool;
        const resolvedTool = this.resolveToolName(requestedTool);
        try {
          const toolResult = await toolRegistry.executeTool(resolvedTool, parsed.parameters || {}, { scene: sceneContext });
          if (toolResult.success) {
            // Simple handling: if tool returns a full scene, return it; if it returns objects, apply patches
            if (toolResult.data && toolResult.data.result && toolResult.data.result.id && toolResult.data.result.objects) {
              return { type: 'create', text: parsed.message || 'Scene created', updatedScene: toolResult.data.result, sceneModifications: [], metadata: { timestamp: new Date().toISOString(), intent: 'create' } };
            }
            if (toolResult.data && toolResult.data.result && Array.isArray(toolResult.data.result)) {
              const objects = toolResult.data.result;
              const patches = objects.map((o: any) => ({ op: 'add', path: '/objects/-', value: o }));
              const updated = this.applyScenePatches(sceneContext, patches);
              return { type: 'tool_result', text: parsed.message || `Generated ${objects.length} objects.`, updatedScene: updated, sceneModifications: patches, metadata: { timestamp: new Date().toISOString(), intent: 'tool_call' } };
            }
            return { type: 'tool_result', text: parsed.message || 'Tool executed', updatedScene: sceneContext, sceneModifications: [], toolResult, metadata: { timestamp: new Date().toISOString(), intent: 'tool_call' } };
          }
          return { type: 'chat', text: `Tool error: ${toolResult.error || 'unknown'}`, updatedScene: sceneContext, sceneModifications: [], metadata: { timestamp: new Date().toISOString(), intent: 'error' } };
        } catch (err: any) {
          return { type: 'chat', text: `Tool execution failed: ${err?.message || String(err)}`, updatedScene: sceneContext, sceneModifications: [], metadata: { timestamp: new Date().toISOString(), intent: 'error' } };
        }
      }

      if (parsed.type === 'chat') {
        return { type: 'chat', text: parsed.content || '', updatedScene: sceneContext, sceneModifications: [], metadata: { timestamp: new Date().toISOString(), intent: 'chat' } };
      }
    }

    // Fallback to raw text
    return { type: 'chat', text, sceneModifications: [], updatedScene: sceneContext, metadata: { timestamp: new Date().toISOString(), intent: 'chat' } };
  }

  // Produce a compact summary of the scene to avoid exceeding model context limits
  summarizeSceneContext(scene: any, maxObjects = 12) {
    if (!scene) return 'No scene.';
    const s: any = { id: scene.id || 'unknown', name: scene.name || '', objectCount: (scene.objects || []).length };
    const list = (scene.objects || []).slice(0, maxObjects).map((o: any) => {
      return {
        id: o.id,
        type: o.type,
        mass: (typeof o.mass === 'number' && typeof o.mass.toFixed === 'function') ? Number(o.mass.toFixed(3)) : o.mass,
        position: Array.isArray(o.position) ? o.position.map((v: any) => (typeof v === 'number' && typeof v.toFixed === 'function') ? +v.toFixed(3) : v) : o.position,
        color: o.color || null
      };
    });
    if ((scene.objects || []).length > maxObjects) s.truncated = true;
    return `SCENE SUMMARY: ${JSON.stringify(s)}\nOBJECTS: ${JSON.stringify(list)}`;
  }

  // Unified processUserMessage - single AI call with integrated planning
  async processUserMessage(message: any, chatContext: any, sceneContext: any) {
    await this.initialize();

    // Use compact scene summary to reduce prompt size and avoid context overflow
    const sceneSummary = this.summarizeSceneContext(sceneContext);
    const compactChat = (chatContext && chatContext.slice) ? chatContext.slice(-8) : chatContext;

    const prompt = `${this.prompt}\n\nCHAT CONTEXT (recent):\n${JSON.stringify(compactChat, null, 2)}\n\n${sceneSummary}\n\nUSER MESSAGE: ${message}`;

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
