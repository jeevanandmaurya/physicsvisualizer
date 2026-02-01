import { AgentCore } from '../sandbox/agent';
import { ModelManager } from './ModelManager';

/**
 * GeminiAIManager (compat layer)
 *
 * Chat UI currently imports this file. Internally it delegates to:
 * - ModelManager (core/ai): model selection + API I/O + error handling
 * - AgentCore (core/sandbox/agent): parsing/thinking/simulation/execution
 */
class GeminiAIManager {
  private isInitialized: boolean;
  private model: ModelManager;
  private agent: AgentCore;

  constructor() {
    this.isInitialized = false;
    this.model = new ModelManager();
    this.agent = new AgentCore();
  }

  async initialize() {
    if (this.isInitialized) return;
    await Promise.all([this.model.initialize(), this.agent.initialize()]);
    this.isInitialized = true;
  }

  // Produce a compact summary of the scene to avoid exceeding model context limits
  private summarizeSceneContext(scene: any, maxObjects = 12) {
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

  /**
   * Main chat entrypoint used by Conversation.tsx
   */
  async processUserMessage(message: any, chatContext: any, sceneContext: any) {
    await this.initialize();

    const sceneSummary = this.summarizeSceneContext(sceneContext);
    const modelResponse = await this.model.sendPrompt(String(message), {
      chatHistory: chatContext?.history ?? chatContext,
      sceneContext: sceneSummary,
    });

    const agentResult = await this.agent.processAIResponse(modelResponse.text, {
      scene: sceneContext,
      chatHistory: chatContext?.history ?? [],
      userMessage: String(message),
    });

    return { ...agentResult, usage: modelResponse.usage };
  }
}

export default GeminiAIManager;
