/**
 * Sandbox Module - Secure isolated execution environments
 * 
 * Architecture:
 * ├── agent/       - Agentic AI operations (parsing, thinking, simulating, executing)
 * ├── execution/   - Code execution sandbox (AI tools, function calls)
 * ├── physics/     - Physics simulation sandbox (future)
 * ├── rendering/   - Rendering sandbox (future)
 * └── shared/      - Shared types and utilities
 */

// Agent module (agentic AI operations)
export {
  AgentCore,
  ResponseParser,
  Thinker,
  Simulator,
  ActionExecutor,
} from './agent';

export type {
  AgentContext,
  AgentResult,
  ParsedResponse,
  ThinkingResult,
  SimulationResult,
  ExecutionResult,
} from './agent';

// Main execution sandbox (most commonly used)
export {
  SandboxManager,
  sandboxManager,
  SandboxPool,
  sandboxPool,
  WorkerSandbox,
  SandboxProtocol,
  sandboxProtocol,
  CodeExecutor,
  codeExecutor,
  // Backward compatibility aliases
  codeExecutor as jsExecutor,
  CodeExecutor as JavaScriptExecutor,
  FunctionCallSystem,
  functionCallSystem,
  // Built-in tools for AI
  executeTool,
  hasTool,
} from './execution';

export type {
  ExecuteOptions,
  ExecuteResult,
  ToolContext,
  ToolResult,
} from './execution';

// Shared types
export type {
  SandboxRequest,
  SandboxResponse,
  SandboxConfig,
  SerializableContext,
  ExecutionMetrics,
  WorkerState,
  SharedMemoryLayout,
} from './shared/types';

export {
  SAFE_GLOBALS,
  BLOCKED_PATTERNS,
  SHARED_MEMORY_SIZE,
  STATUS_IDLE,
  STATUS_EXECUTING,
  STATUS_DONE,
  STATUS_ERROR,
} from './shared/types';

// Future sandboxes (placeholders)
export { PHYSICS_SANDBOX_VERSION } from './physics';
export { RENDERING_SANDBOX_VERSION } from './rendering';

// Pre-initialize execution pool on module load
import { sandboxPool } from './execution';

if (typeof window !== 'undefined') {
  // Warm up workers in background (non-blocking)
  const init = () => sandboxPool.initialize().catch(console.error);
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(init);
  } else {
    setTimeout(init, 100);
  }
}
