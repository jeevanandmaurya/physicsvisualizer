/**
 * Sandbox Module - Secure code execution system
 * High-performance isolation using Web Workers + SharedArrayBuffer
 */

export { SandboxManager, sandboxManager } from './SandboxManager';
export type { ExecuteOptions, ExecuteResult } from './SandboxManager';

export { SandboxPool, sandboxPool } from './SandboxPool';
export { WorkerSandbox } from './WorkerSandbox';
export { SandboxProtocol, sandboxProtocol } from './SandboxProtocol';

export type {
  SandboxRequest,
  SandboxResponse,
  SandboxConfig,
  SerializableContext,
  ExecutionMetrics,
} from './types';

export {
  SAFE_GLOBALS,
  BLOCKED_PATTERNS,
  SHARED_MEMORY_SIZE,
  STATUS_IDLE,
  STATUS_EXECUTING,
  STATUS_DONE,
  STATUS_ERROR,
} from './types';

// Pre-initialize pool on module load for instant execution
import { sandboxPool } from './SandboxPool';

// Warm up workers in background (non-blocking)
if (typeof window !== 'undefined') {
  // Defer initialization to avoid blocking initial page load
  requestIdleCallback?.(() => {
    sandboxPool.initialize().catch(console.error);
  }) || setTimeout(() => {
    sandboxPool.initialize().catch(console.error);
  }, 100);
}
