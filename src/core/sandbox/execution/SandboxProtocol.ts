/**
 * SandboxProtocol - High-performance message protocol
 * Uses SharedArrayBuffer + Atomics for near-zero latency when available
 */

import {
  SandboxRequest,
  SandboxResponse,
  SHARED_MEMORY_SIZE,
  STATUS_IDLE,
  STATUS_EXECUTING,
  STATUS_DONE,
  STATUS_ERROR,
} from '../shared/types';

export class SandboxProtocol {
  private sharedBuffer: SharedArrayBuffer | null = null;
  private controlArray: Int32Array | null = null;
  private dataArray: Uint8Array | null = null;
  private textEncoder = new TextEncoder();
  private textDecoder = new TextDecoder();
  private supportsSharedMemory: boolean;

  constructor() {
    // Check if SharedArrayBuffer is available (requires COOP/COEP headers)
    this.supportsSharedMemory = typeof SharedArrayBuffer !== 'undefined';
    
    if (this.supportsSharedMemory) {
      try {
        this.sharedBuffer = new SharedArrayBuffer(SHARED_MEMORY_SIZE);
        this.controlArray = new Int32Array(this.sharedBuffer, 0, 2);
        this.dataArray = new Uint8Array(this.sharedBuffer, 8);
        console.log('✅ SandboxProtocol: Using SharedArrayBuffer for fast communication');
      } catch (e) {
        console.warn('⚠️ SharedArrayBuffer not available, falling back to postMessage');
        this.supportsSharedMemory = false;
      }
    }
  }

  /**
   * Get shared buffer for worker initialization
   */
  getSharedBuffer(): SharedArrayBuffer | null {
    return this.sharedBuffer;
  }

  /**
   * Check if fast mode is available
   */
  isFastModeAvailable(): boolean {
    return this.supportsSharedMemory && this.sharedBuffer !== null;
  }

  /**
   * Serialize request for transfer
   * Uses transferable objects when possible
   */
  serializeRequest(request: SandboxRequest): { data: string; transferables: Transferable[] } {
    const json = JSON.stringify(request);
    
    // For large payloads, use ArrayBuffer transfer
    if (json.length > 10000) {
      const encoded = this.textEncoder.encode(json);
      const buffer = encoded.buffer;
      return {
        data: '', // Signal that data is in transferable
        transferables: [buffer],
      };
    }
    
    return { data: json, transferables: [] };
  }

  /**
   * Deserialize response from worker
   */
  deserializeResponse(data: string | ArrayBuffer): SandboxResponse {
    if (data instanceof ArrayBuffer) {
      const decoded = this.textDecoder.decode(new Uint8Array(data));
      return JSON.parse(decoded);
    }
    return JSON.parse(data);
  }

  /**
   * Write result to shared memory (called from worker)
   */
  writeToSharedMemory(result: string): void {
    if (!this.controlArray || !this.dataArray) return;
    
    const encoded = this.textEncoder.encode(result);
    const size = Math.min(encoded.length, this.dataArray.length);
    
    // Write data
    this.dataArray.set(encoded.subarray(0, size));
    
    // Write size and signal completion
    Atomics.store(this.controlArray, 1, size);
    Atomics.store(this.controlArray, 0, STATUS_DONE);
    Atomics.notify(this.controlArray, 0);
  }

  /**
   * Check status of shared memory (non-blocking, safe for main thread)
   * Returns current status without waiting
   */
  checkStatus(): number {
    if (!this.controlArray) return STATUS_IDLE;
    return Atomics.load(this.controlArray, 0);
  }

  /**
   * Read result from shared memory (non-blocking poll)
   * Safe to call from main thread - uses Atomics.load instead of Atomics.wait
   */
  readFromSharedMemory(): SandboxResponse | null {
    if (!this.controlArray || !this.dataArray) return null;
    
    const status = Atomics.load(this.controlArray, 0);
    
    // Still executing - return null to indicate "not ready yet"
    if (status === STATUS_EXECUTING || status === STATUS_IDLE) {
      return null;
    }
    
    const size = Atomics.load(this.controlArray, 1);
    
    // Copy from SharedArrayBuffer to regular ArrayBuffer for TextDecoder
    // (TextDecoder cannot decode shared views directly)
    const copyBuffer = new Uint8Array(size);
    copyBuffer.set(this.dataArray.subarray(0, size));
    
    if (status === STATUS_ERROR) {
      const errorText = this.textDecoder.decode(copyBuffer);
      return {
        id: '',
        success: false,
        error: errorText,
      };
    }
    
    if (status === STATUS_DONE) {
      const resultText = this.textDecoder.decode(copyBuffer);
      try {
        return JSON.parse(resultText);
      } catch {
        return {
          id: '',
          success: true,
          result: resultText,
        };
      }
    }
    
    return null;
  }

  /**
   * Reset shared memory for next execution
   */
  resetSharedMemory(): void {
    if (!this.controlArray) return;
    Atomics.store(this.controlArray, 0, STATUS_IDLE);
    Atomics.store(this.controlArray, 1, 0);
  }

  /**
   * Signal execution start
   */
  signalExecutionStart(): void {
    if (!this.controlArray) return;
    Atomics.store(this.controlArray, 0, STATUS_EXECUTING);
  }
}

// Singleton instance
export const sandboxProtocol = new SandboxProtocol();
