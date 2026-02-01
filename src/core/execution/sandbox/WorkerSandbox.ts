/**
 * WorkerSandbox - High-performance Web Worker based sandbox
 * Pre-warmed workers with fast message passing
 */

import {
  SandboxRequest,
  SandboxResponse,
} from './types';
import { sandboxProtocol } from './SandboxProtocol';

export class WorkerSandbox {
  private worker: Worker;
  private pendingRequests: Map<string, {
    resolve: (value: SandboxResponse) => void;
    reject: (error: Error) => void;
    startTime: number;
    timeout: ReturnType<typeof setTimeout>;
  }> = new Map();
  
  private ready: boolean = false;
  private readyPromise: Promise<void>;
  private readyResolve!: () => void;
  private useSharedMemory: boolean;
  private sharedBuffer: SharedArrayBuffer | null;

  constructor() {
    this.useSharedMemory = sandboxProtocol.isFastModeAvailable();
    this.sharedBuffer = sandboxProtocol.getSharedBuffer();
    
    // Create worker from blob for inline worker code
    const workerCode = this.generateWorkerCode();
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    
    this.worker = new Worker(workerUrl);
    
    this.readyPromise = new Promise((resolve) => {
      this.readyResolve = resolve;
    });
    
    this.worker.onmessage = this.handleMessage.bind(this);
    this.worker.onerror = this.handleError.bind(this);
    
    // Initialize worker with shared buffer if available
    this.initWorker();
    
    // Cleanup blob URL
    URL.revokeObjectURL(workerUrl);
  }

  private generateWorkerCode(): string {
    return `
// Sandbox Worker - Isolated JavaScript execution environment

let sharedBuffer = null;
let controlArray = null;
let dataArray = null;
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

// Safe execution environment
const safeGlobals = {
  Math: Math,
  JSON: JSON,
  Object: Object,
  Array: Array,
  String: String,
  Number: Number,
  Boolean: Boolean,
  Date: Date,
  Map: Map,
  Set: Set,
  WeakMap: WeakMap,
  WeakSet: WeakSet,
  Promise: Promise,
  Symbol: Symbol,
  Error: Error,
  TypeError: TypeError,
  RangeError: RangeError,
  isNaN: isNaN,
  isFinite: isFinite,
  parseFloat: parseFloat,
  parseInt: parseInt,
  
  // Vector3 utility
  Vector3: class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
      this.x = x; this.y = y; this.z = z;
    }
    static fromArray(arr) { return new Vector3(arr[0] || 0, arr[1] || 0, arr[2] || 0); }
    toArray() { return [this.x, this.y, this.z]; }
    add(v) { return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z); }
    subtract(v) { return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z); }
    multiply(s) { return new Vector3(this.x * s, this.y * s, this.z * s); }
    magnitude() { return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z); }
    normalize() { const m = this.magnitude(); return m > 0 ? this.multiply(1/m) : new Vector3(); }
    dot(v) { return this.x*v.x + this.y*v.y + this.z*v.z; }
    cross(v) { return new Vector3(this.y*v.z - this.z*v.y, this.z*v.x - this.x*v.z, this.x*v.y - this.y*v.x); }
  },
  
  // Physics utilities
  Physics: {
    gravityForce: (m1, m2, d, G = 6.674e-11) => d > 0 ? (G * m1 * m2) / (d * d) : 0,
    springForce: (k, x) => -k * x,
    kineticEnergy: (m, v) => 0.5 * m * v * v,
    potentialEnergy: (m, h, g = 9.81) => m * g * h,
    momentum: (m, v) => m * v,
    distance: (p1, p2) => Math.sqrt((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2 + (p1[2]-p2[2])**2),
  },
  
  // Utility functions
  lerp: (a, b, t) => a + (b - a) * t,
  clamp: (val, min, max) => Math.max(min, Math.min(max, val)),
  random: (min = 0, max = 1) => Math.random() * (max - min) + min,
};

// Captured console output
let consoleOutput = [];
const capturedConsole = {
  log: (...args) => consoleOutput.push('LOG: ' + args.map(String).join(' ')),
  warn: (...args) => consoleOutput.push('WARN: ' + args.map(String).join(' ')),
  error: (...args) => consoleOutput.push('ERROR: ' + args.map(String).join(' ')),
  info: (...args) => consoleOutput.push('INFO: ' + args.map(String).join(' ')),
};

// Execute code in isolated scope
function executeCode(code, context, returnType) {
  consoleOutput = [];
  const startTime = performance.now();
  
  // Create execution scope with context
  const scope = {
    ...safeGlobals,
    console: capturedConsole,
    params: context?.params || {},
    scene: context?.scene ? JSON.parse(JSON.stringify(context.scene)) : null,
    time: context?.time || 0,
  };
  
  // Build function arguments
  const argNames = Object.keys(scope);
  const argValues = Object.values(scope);
  
  try {
    // Create and execute function
    const fn = new Function(...argNames, code);
    let result = fn(...argValues);
    
    // Process result based on return type
    if (returnType === 'objects' && Array.isArray(result)) {
      result = result.map(validateObject);
    } else if (returnType === 'objects' && result && typeof result === 'object' && !Array.isArray(result)) {
      result = [validateObject(result)];
    }
    
    return {
      success: true,
      result: result,
      console: consoleOutput.slice(0, 50),
      metrics: { executionTime: performance.now() - startTime },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || String(error),
      console: consoleOutput,
      metrics: { executionTime: performance.now() - startTime },
    };
  }
}

// Validate generated scene object
function validateObject(obj) {
  if (!obj || typeof obj !== 'object') return null;
  return {
    id: obj.id || 'obj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    type: obj.type || 'Sphere',
    mass: obj.mass ?? 1,
    position: Array.isArray(obj.position) ? obj.position : [0, 0, 0],
    velocity: Array.isArray(obj.velocity) ? obj.velocity : [0, 0, 0],
    rotation: Array.isArray(obj.rotation) ? obj.rotation : [0, 0, 0],
    color: obj.color || '#888888',
    ...obj,
  };
}

// Write result to shared memory for fast retrieval
function writeToSharedMemory(response) {
  if (!controlArray || !dataArray) return false;
  
  const json = JSON.stringify(response);
  const encoded = textEncoder.encode(json);
  const size = Math.min(encoded.length, dataArray.length);
  
  dataArray.set(encoded.subarray(0, size));
  Atomics.store(controlArray, 1, size);
  Atomics.store(controlArray, 0, response.success ? 2 : 3); // 2=done, 3=error
  Atomics.notify(controlArray, 0);
  
  return true;
}

// Message handler
self.onmessage = function(e) {
  const { type, data, sharedBuffer: sb } = e.data;
  
  if (type === 'init') {
    if (sb) {
      sharedBuffer = sb;
      controlArray = new Int32Array(sharedBuffer, 0, 2);
      dataArray = new Uint8Array(sharedBuffer, 8);
    }
    self.postMessage({ type: 'ready' });
    return;
  }
  
  if (type === 'execute') {
    const request = typeof data === 'string' ? JSON.parse(data) : data;
    const { id, code, context, returnType, timeout } = request;
    
    // Execute with wrapping to return value
    const wrappedCode = code.includes('return') ? code : 'return (' + code + ')';
    const response = executeCode(wrappedCode, context, returnType);
    response.id = id;
    
    // Try shared memory first for speed
    if (sharedBuffer && writeToSharedMemory(response)) {
      return; // Main thread will read from shared memory
    }
    
    // Fallback to postMessage
    self.postMessage({ type: 'result', data: response });
  }
  
  if (type === 'batch') {
    const requests = typeof data === 'string' ? JSON.parse(data) : data;
    const results = requests.map(req => {
      const wrappedCode = req.code.includes('return') ? req.code : 'return (' + req.code + ')';
      const response = executeCode(wrappedCode, req.context, req.returnType);
      response.id = req.id;
      return response;
    });
    self.postMessage({ type: 'batch_result', data: results });
  }
};
`;
  }

  private initWorker(): void {
    const initMessage: any = { type: 'init' };
    
    if (this.useSharedMemory && this.sharedBuffer) {
      initMessage.sharedBuffer = this.sharedBuffer;
    }
    
    this.worker.postMessage(initMessage);
  }

  private handleMessage(event: MessageEvent): void {
    const { type, data } = event.data;
    
    if (type === 'ready') {
      this.ready = true;
      this.readyResolve();
      return;
    }
    
    if (type === 'result') {
      const response = data as SandboxResponse;
      const pending = this.pendingRequests.get(response.id);
      
      if (pending) {
        clearTimeout(pending.timeout);
        this.pendingRequests.delete(response.id);
        
        // Add queue time to metrics
        if (response.metrics) {
          response.metrics.queueTime = performance.now() - pending.startTime - (response.metrics.executionTime || 0);
        }
        
        pending.resolve(response);
      }
    }
    
    if (type === 'batch_result') {
      const responses = data as SandboxResponse[];
      for (const response of responses) {
        const pending = this.pendingRequests.get(response.id);
        if (pending) {
          clearTimeout(pending.timeout);
          this.pendingRequests.delete(response.id);
          pending.resolve(response);
        }
      }
    }
  }

  private handleError(error: ErrorEvent): void {
    console.error('Worker error:', error);
    // Reject all pending requests
    for (const [, pending] of this.pendingRequests) {
      clearTimeout(pending.timeout);
      pending.reject(new Error(`Worker error: ${error.message}`));
    }
    this.pendingRequests.clear();
  }

  /**
   * Wait for worker to be ready
   */
  async waitForReady(): Promise<void> {
    return this.readyPromise;
  }

  /**
   * Check if worker is ready
   */
  isReady(): boolean {
    return this.ready;
  }

  /**
   * Execute code in sandbox
   */
  async execute(request: SandboxRequest): Promise<SandboxResponse> {
    await this.waitForReady();
    
    const startTime = performance.now();
    const timeout = request.timeout || 5000;
    
    return new Promise((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        this.pendingRequests.delete(request.id);
        resolve({
          id: request.id,
          success: false,
          error: `Execution timed out after ${timeout}ms`,
          metrics: { executionTime: timeout },
        });
      }, timeout);
      
      this.pendingRequests.set(request.id, {
        resolve,
        reject,
        startTime,
        timeout: timeoutHandle,
      });
      
      // Use shared memory for signaling if available
      if (this.useSharedMemory) {
        sandboxProtocol.resetSharedMemory();
        sandboxProtocol.signalExecutionStart();
      }
      
      // Send execution request
      const { data, transferables } = sandboxProtocol.serializeRequest(request);
      
      if (transferables.length > 0) {
        this.worker.postMessage({ type: 'execute', data: transferables[0] }, transferables);
      } else {
        this.worker.postMessage({ type: 'execute', data });
      }
      
      // If using shared memory, poll for result (faster than waiting for postMessage)
      if (this.useSharedMemory) {
        this.pollSharedMemory(request.id, timeout, resolve, startTime);
      }
    });
  }

  private pollSharedMemory(
    requestId: string,
    timeout: number,
    resolve: (value: SandboxResponse) => void,
    startTime: number
  ): void {
    const pollInterval = 0.1; // 0.1ms polling for minimal latency
    const maxPolls = timeout / pollInterval;
    let polls = 0;
    
    const poll = () => {
      const response = sandboxProtocol.readFromSharedMemory(1);
      
      if (response && (response.success || response.error)) {
        const pending = this.pendingRequests.get(requestId);
        if (pending) {
          clearTimeout(pending.timeout);
          this.pendingRequests.delete(requestId);
          response.id = requestId;
          if (response.metrics) {
            response.metrics.queueTime = performance.now() - startTime - (response.metrics.executionTime || 0);
          }
          resolve(response);
        }
        return;
      }
      
      polls++;
      if (polls < maxPolls) {
        // Use requestAnimationFrame for efficient polling without blocking
        setTimeout(poll, pollInterval);
      }
    };
    
    // Start polling after a tiny delay to let worker start
    setTimeout(poll, 0.1);
  }

  /**
   * Execute batch of requests
   */
  async executeBatch(requests: SandboxRequest[]): Promise<SandboxResponse[]> {
    await this.waitForReady();
    
    const startTime = performance.now();
    
    return new Promise((resolve, reject) => {
      const results: SandboxResponse[] = [];
      let completed = 0;
      
      const timeout = setTimeout(() => {
        for (const req of requests) {
          this.pendingRequests.delete(req.id);
        }
        resolve(results);
      }, Math.max(...requests.map(r => r.timeout || 5000)));
      
      for (const request of requests) {
        this.pendingRequests.set(request.id, {
          resolve: (response) => {
            results.push(response);
            completed++;
            if (completed === requests.length) {
              clearTimeout(timeout);
              resolve(results);
            }
          },
          reject,
          startTime,
          timeout,
        });
      }
      
      this.worker.postMessage({ type: 'batch', data: JSON.stringify(requests) });
    });
  }

  /**
   * Terminate worker
   */
  terminate(): void {
    for (const [, pending] of this.pendingRequests) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Worker terminated'));
    }
    this.pendingRequests.clear();
    this.worker.terminate();
  }
}
