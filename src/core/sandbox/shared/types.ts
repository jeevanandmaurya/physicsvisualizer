/**
 * Sandbox Types - TypeScript interfaces for the sandbox system
 * High-performance code execution with minimal postMessage overhead
 */

export interface SandboxRequest {
  id: string;
  type: 'execute' | 'call' | 'batch' | 'terminate' | 'warmup';
  code?: string;
  functionName?: string;
  args?: unknown[];
  context?: SerializableContext;
  timeout?: number;
  returnType?: 'value' | 'objects' | 'scene';
}

export interface SandboxResponse {
  id: string;
  success: boolean;
  result?: unknown;
  error?: string;
  console?: string[];
  animations?: Array<{
    objectId: string;
    type?: string;
    options?: unknown;
    [key: string]: unknown;
  }>;
  metrics?: ExecutionMetrics;
}

export interface ExecutionMetrics {
  executionTime: number;
  queueTime?: number;
  serializationTime?: number;
  memoryUsed?: number;
}

export interface SerializableContext {
  scene?: unknown;
  params?: Record<string, unknown>;
  time?: number;
  [key: string]: unknown;
}

export interface SandboxConfig {
  maxWorkers: number;
  warmPoolSize: number;
  defaultTimeout: number;
  maxMemory: number;
  useSharedMemory: boolean;
}

export interface WorkerState {
  worker: Worker;
  busy: boolean;
  lastUsed: number;
  executionCount: number;
  id: string;
}

// Shared memory layout for fast communication
export interface SharedMemoryLayout {
  // Control flags (Int32)
  STATUS: 0;      // 0=idle, 1=executing, 2=done, 3=error
  RESULT_SIZE: 1; // Size of result in bytes
  // Data buffer starts at offset 8 (2 * 4 bytes)
  DATA_OFFSET: 8;
}

export const SHARED_MEMORY_SIZE = 1024 * 1024; // 1MB shared buffer
export const STATUS_IDLE = 0;
export const STATUS_EXECUTING = 1;
export const STATUS_DONE = 2;
export const STATUS_ERROR = 3;

// Safe globals that can be exposed in sandbox
export const SAFE_GLOBALS = [
  'Math',
  'JSON',
  'Object',
  'Array',
  'String',
  'Number',
  'Boolean',
  'Date',
  'Map',
  'Set',
  'WeakMap',
  'WeakSet',
  'Promise',
  'Symbol',
  'Reflect',
  'Proxy',
  'Error',
  'TypeError',
  'RangeError',
  'isNaN',
  'isFinite',
  'parseFloat',
  'parseInt',
  'encodeURI',
  'decodeURI',
  'encodeURIComponent',
  'decodeURIComponent',
] as const;

// Blocked patterns for security
export const BLOCKED_PATTERNS = [
  /\beval\b/,
  /\bFunction\b/,
  /\bimport\b/,
  /\brequire\b/,
  /\bfetch\b/,
  /\bXMLHttpRequest\b/,
  /\bWebSocket\b/,
  /\b__proto__\b/,
  /\bconstructor\s*\[/,
  /\bprototype\b/,
  /\bglobalThis\b/,
  /\bself\b/,
  /\bwindow\b/,
  /\bdocument\b/,
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
  /\bindexedDB\b/,
  /\bpostMessage\b/,
  /\bimportScripts\b/,
] as const;
