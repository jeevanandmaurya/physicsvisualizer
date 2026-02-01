/**
 * Agent Module - Handles all agentic AI operations
 * 
 * This module is responsible for:
 * - Parsing AI responses
 * - Planning and reasoning (thinking)
 * - Simulating actions before execution
 * - Executing tools and actions
 * - Managing agent state and context
 * 
 * The AI folder (../ai) handles only:
 * - Model selection and configuration
 * - API input/output
 * - Error handling for API calls
 */

export { AgentCore } from './AgentCore.ts';
export { ResponseParser } from './parsing/ResponseParser.ts';
export { Thinker } from './thinking/Thinker.ts';
export { Simulator } from './simulation/Simulator.ts';
export { ActionExecutor } from './execution/ActionExecutor.ts';

// Types
export type { 
  AgentContext, 
  AgentResult, 
  ParsedResponse, 
  ThinkingResult, 
  SimulationResult, 
  ExecutionResult 
} from './types';
