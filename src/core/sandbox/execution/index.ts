/**
 * Execution Sandbox - Secure code execution in Web Workers
 * Handles AI-generated code, tool execution, and function calls
 */

export { SandboxManager, sandboxManager } from './SandboxManager';
export type { ExecuteOptions, ExecuteResult } from './SandboxManager';

export { SandboxPool, sandboxPool } from './SandboxPool';
export { WorkerSandbox } from './WorkerSandbox';
export { SandboxProtocol, sandboxProtocol } from './SandboxProtocol';

export { CodeExecutor, codeExecutor } from './CodeExecutor';
export { FunctionCallSystem, functionCallSystem } from './FunctionCallSystem';

// Built-in tools for AI
export { executeTool, hasTool } from './tools';
export type { ToolContext, ToolResult } from './tools';

// Re-export shared types
export type {
  SandboxRequest,
  SandboxResponse,
  SandboxConfig,
  SerializableContext,
  ExecutionMetrics,
} from '../shared/types';

export {
  SAFE_GLOBALS,
  BLOCKED_PATTERNS,
  SHARED_MEMORY_SIZE,
  STATUS_IDLE,
  STATUS_EXECUTING,
  STATUS_DONE,
  STATUS_ERROR,
} from '../shared/types';
