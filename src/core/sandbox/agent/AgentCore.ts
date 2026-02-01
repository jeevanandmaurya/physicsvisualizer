/**
 * AgentCore - Main orchestrator for agentic AI operations
 * 
 * Coordinates the full agent pipeline:
 * 1. Parse AI response
 * 2. Think/plan what actions to take
 * 3. Simulate actions to preview impact
 * 4. Execute actions
 */

import { ResponseParser } from './parsing/ResponseParser';
import { Thinker } from './thinking/Thinker';
import { Simulator } from './simulation/Simulator';
import { ActionExecutor } from './execution/ActionExecutor';
import type { 
  AgentContext, 
  AgentResult, 
  ParsedResponse, 
  ThinkingResult,
  SimulationResult 
} from './types';

export class AgentCore {
  private parser: ResponseParser;
  private thinker: Thinker;
  private simulator: Simulator;
  private executor: ActionExecutor;
  private isInitialized: boolean = false;

  constructor() {
    this.parser = new ResponseParser();
    this.thinker = new Thinker();
    this.simulator = new Simulator();
    this.executor = new ActionExecutor();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    await Promise.all([
      this.parser.initialize(),
      this.thinker.initialize(),
      this.simulator.initialize(),
      this.executor.initialize()
    ]);
    
    this.isInitialized = true;
    console.log('✅ AgentCore initialized');
  }

  /**
   * Process raw AI response through the full agent pipeline
   */
  async processAIResponse(rawResponse: string, context: AgentContext): Promise<AgentResult> {
    const startTime = performance.now();
    
    // Step 1: Parse the response
    console.log('🔍 Agent: Parsing response...');
    const parsed = await this.parser.parse(rawResponse);
    
    if (parsed.type === 'error') {
      return this.createErrorResult(parsed.parseErrors.join(', '), context);
    }

    // Step 2: Think/plan based on parsed response
    console.log('🧠 Agent: Thinking/planning...');
    const thinkResult = await this.thinker.analyze(parsed, context);
    
    if (thinkResult.needsClarification) {
      return this.createClarificationResult(thinkResult.clarificationQuestion || 'Could you clarify?', context);
    }

    // Step 3: Simulate each action in the plan
    console.log('🎮 Agent: Simulating actions...');
    const simulations: SimulationResult[] = [];
    for (const action of thinkResult.plan) {
      const sim = await this.simulator.simulate(action, context);
      simulations.push(sim);
      
      // Stop if simulation shows critical error
      if (sim.errors.length > 0 && sim.estimatedImpact.isDestructive) {
        return this.createErrorResult(`Simulation failed: ${sim.errors.join(', ')}`, context);
      }
    }

    // Step 4: Execute the plan
    console.log('⚡ Agent: Executing actions...');
    let currentScene = context.scene;
    const toolsUsed: string[] = [];
    const allModifications: any[] = [];

    for (let i = 0; i < thinkResult.plan.length; i++) {
      const action = thinkResult.plan[i];
      const result = await this.executor.execute(action, { ...context, scene: currentScene });
      
      if (!result.success) {
        console.warn(`Action ${i + 1} failed:`, result.error);
        continue;
      }

      if (action.tool) toolsUsed.push(action.tool);
      if (result.data?.scene) currentScene = result.data.scene;
      if (result.data?.modifications) allModifications.push(...result.data.modifications);
    }

    const executionTime = performance.now() - startTime;

    const resultType = this.mapIntentToResultType(thinkResult.intent);

    // Important: keep Conversation.tsx semantics stable:
    // - Only set updatedScene for real scene creation.
    // - For edits, return patches via sceneModifications and leave updatedScene null.
    // - For chat, return neither.
    let updatedScene: any | null = null;
    let sceneModifications: any[] = [];

    if (resultType === 'create') {
      updatedScene = currentScene;
      sceneModifications = [];
    } else if (allModifications.length > 0) {
      updatedScene = null;
      sceneModifications = allModifications;
    }

    return {
      type: resultType,
      text: parsed.message || this.generateResultMessage(thinkResult),
      updatedScene,
      sceneModifications,
      metadata: {
        timestamp: new Date().toISOString(),
        intent: thinkResult.intent,
        hasModifications: (resultType === 'create') || (allModifications.length > 0),
        executionTime,
        toolsUsed
      }
    };
  }

  /**
   * Quick parse without full pipeline - useful for streaming
   */
  async quickParse(rawResponse: string): Promise<ParsedResponse> {
    return this.parser.parse(rawResponse);
  }

  /**
   * Simulate an action without executing
   */
  async simulateAction(action: any, context: AgentContext): Promise<SimulationResult> {
    return this.simulator.simulate(action, context);
  }

  private createErrorResult(error: string, _context: AgentContext): AgentResult {
    return {
      type: 'error',
      text: error,
      updatedScene: null,
      sceneModifications: [],
      metadata: {
        timestamp: new Date().toISOString(),
        intent: 'error',
        hasModifications: false
      }
    };
  }

  private createClarificationResult(question: string, _context: AgentContext): AgentResult {
    return {
      type: 'chat',
      text: question,
      updatedScene: null,
      sceneModifications: [],
      metadata: {
        timestamp: new Date().toISOString(),
        intent: 'clarify',
        hasModifications: false
      }
    };
  }

  private mapIntentToResultType(intent: string): 'create' | 'edit' | 'chat' | 'error' {
    switch (intent) {
      case 'create': return 'create';
      case 'edit': return 'edit';
      case 'tool': return 'edit';
      default: return 'chat';
    }
  }

  private generateResultMessage(thinkResult: ThinkingResult): string {
    switch (thinkResult.intent) {
      case 'create': return 'Created new scene';
      case 'edit': return 'Modified scene';
      case 'tool': return 'Executed tool';
      case 'query': return 'Here\'s the information you requested';
      default: return '';
    }
  }
}
