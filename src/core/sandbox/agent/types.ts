/**
 * Type definitions for the Agent system
 */

// Context passed to the agent for processing
export interface AgentContext {
  scene: any;
  chatHistory: any[];
  userMessage: string;
  previousActions?: AgentAction[];
}

// Actions the agent can take
export interface AgentAction {
  type: 'tool_call' | 'scene_create' | 'scene_edit' | 'chat' | 'clarify';
  tool?: string;
  parameters?: Record<string, any>;
  patches?: any[];
  scene?: any;
  message?: string;
}

// Result of parsing an AI response
export interface ParsedResponse {
  type: 'tool_call' | 'create_scene' | 'edit_patches' | 'chat' | 'error';
  rawText: string;
  parsed: any | null;
  tool?: string;
  parameters?: Record<string, any>;
  patches?: any[];
  scene?: any;
  message?: string;
  confidence: number;
  parseErrors: string[];
}

// Result of the thinking/planning phase
export interface ThinkingResult {
  intent: 'create' | 'edit' | 'query' | 'chat' | 'tool';
  plan: AgentAction[];
  reasoning: string;
  needsClarification: boolean;
  clarificationQuestion?: string;
  confidence: number;
}

// Result of simulating an action
export interface SimulationResult {
  success: boolean;
  preview: any;
  warnings: string[];
  errors: string[];
  estimatedImpact: {
    objectsAffected: number;
    propertiesChanged: string[];
    isDestructive: boolean;
  };
}

// Result of executing an action
export interface ExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
  sideEffects: string[];
}

// Final result from the agent
export interface AgentResult {
  type: 'create' | 'edit' | 'chat' | 'error';
  text: string;
  updatedScene: any | null;
  sceneModifications: any[];
  metadata: {
    timestamp: string;
    intent: string;
    hasModifications: boolean;
    executionTime?: number;
    toolsUsed?: string[];
  };
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Tool definition
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
  execute: (params: any, context: any) => Promise<any>;
}

// Model configuration
export interface ModelConfig {
  provider: 'gemini' | 'ollama' | 'openai' | 'anthropic';
  model: string;
  apiKey?: string;
  endpoint?: string;
  maxTokens: number;
  temperature: number;
}
