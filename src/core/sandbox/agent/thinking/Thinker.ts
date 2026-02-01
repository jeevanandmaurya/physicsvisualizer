/**
 * Thinker - Reasoning and planning module
 * 
 * Analyzes parsed responses and creates action plans:
 * - Intent classification
 * - Action planning
 * - Confidence assessment
 * - Clarification detection
 */

import type { ParsedResponse, ThinkingResult, AgentContext, AgentAction } from '../types';

export class Thinker {
  private isInitialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;
  }

  /**
   * Analyze parsed response and create action plan
   */
  async analyze(parsed: ParsedResponse, context: AgentContext): Promise<ThinkingResult> {
    const intent = this.classifyIntent(parsed, context);
    const plan = this.createPlan(parsed, intent, context);
    const needsClarification = this.checkNeedsClarification(parsed, context);
    
    return {
      intent,
      plan,
      reasoning: this.generateReasoning(parsed, intent),
      needsClarification,
      clarificationQuestion: needsClarification ? this.generateClarification(parsed, context) : undefined,
      confidence: parsed.confidence * this.assessPlanConfidence(plan)
    };
  }

  /**
   * Classify the user's intent from the parsed response
   */
  private classifyIntent(parsed: ParsedResponse, context: AgentContext): ThinkingResult['intent'] {
    switch (parsed.type) {
      case 'create_scene':
        return 'create';
      
      case 'edit_patches':
        return 'edit';
      
      case 'tool_call':
        // Determine if tool creates or edits
        const creationTools = ['generate_complete_scene', 'generate_scene_objects'];
        if (parsed.tool && creationTools.includes(parsed.tool)) {
          return 'create';
        }
        return 'tool';
      
      case 'chat':
        // Check if it's a query about the scene
        const queryKeywords = ['what', 'how', 'why', 'explain', 'describe', 'show'];
        const message = (parsed.message || context.userMessage).toLowerCase();
        if (queryKeywords.some(kw => message.startsWith(kw))) {
          return 'query';
        }
        return 'chat';
      
      default:
        return 'chat';
    }
  }

  /**
   * Create a plan of actions to execute
   */
  private createPlan(parsed: ParsedResponse, _intent: string, _context: AgentContext): AgentAction[] {
    const actions: AgentAction[] = [];

    switch (parsed.type) {
      case 'tool_call':
        actions.push({
          type: 'tool_call',
          tool: parsed.tool,
          parameters: parsed.parameters,
          message: parsed.message
        });
        break;

      case 'create_scene':
        actions.push({
          type: 'scene_create',
          scene: parsed.scene,
          message: parsed.message
        });
        break;

      case 'edit_patches':
        actions.push({
          type: 'scene_edit',
          patches: parsed.patches,
          message: parsed.message
        });
        break;

      case 'chat':
        actions.push({
          type: 'chat',
          message: parsed.message
        });
        break;
    }

    return actions;
  }

  /**
   * Check if we need clarification from the user
   */
  private checkNeedsClarification(parsed: ParsedResponse, context: AgentContext): boolean {
    // Low confidence response
    if (parsed.confidence < 0.5) {
      return true;
    }

    // Ambiguous scene references
    if (parsed.type === 'edit_patches' && parsed.patches) {
      const hasWildcardPath = parsed.patches.some((p: any) => 
        p.path?.includes('*') || p.path?.includes('?')
      );
      if (hasWildcardPath) return true;
    }

    // Empty or minimal context with complex request
    if (!context.scene && parsed.type !== 'create_scene') {
      const isComplexEdit = parsed.type === 'edit_patches' || 
        (parsed.type === 'tool_call' && parsed.tool?.includes('edit'));
      if (isComplexEdit) return true;
    }

    return false;
  }

  /**
   * Generate clarification question
   */
  private generateClarification(parsed: ParsedResponse, context: AgentContext): string {
    if (parsed.confidence < 0.5) {
      return "I'm not sure I understood correctly. Could you rephrase your request?";
    }

    if (!context.scene && parsed.type !== 'create_scene') {
      return "There's no scene loaded. Would you like me to create a new scene first?";
    }

    return "Could you provide more details about what you'd like to do?";
  }

  /**
   * Generate reasoning explanation
   */
  private generateReasoning(parsed: ParsedResponse, intent: string): string {
    const parts: string[] = [];
    
    parts.push(`Detected intent: ${intent}`);
    parts.push(`Response type: ${parsed.type}`);
    
    if (parsed.tool) {
      parts.push(`Tool to use: ${parsed.tool}`);
    }
    
    if (parsed.patches?.length) {
      parts.push(`Patches to apply: ${parsed.patches.length}`);
    }

    return parts.join('. ');
  }

  /**
   * Assess confidence in the plan
   */
  private assessPlanConfidence(plan: AgentAction[]): number {
    if (plan.length === 0) return 0.5;
    if (plan.length > 3) return 0.7; // Complex plans have lower confidence
    return 1.0;
  }
}
