/**
 * SandboxManager - Unified API for sandboxed code execution
 * High-performance execution with security isolation
 */

import { sandboxPool, SandboxPool } from './SandboxPool';
import {
  SandboxRequest,
  SandboxResponse,
  SerializableContext,
  BLOCKED_PATTERNS,
} from '../shared/types';

export interface ExecuteOptions {
  timeout?: number;
  returnType?: 'value' | 'objects' | 'scene';
  context?: SerializableContext;
  allowSceneModification?: boolean;
}

export interface ExecuteResult {
  success: boolean;
  data?: any;
  error?: string;
  console?: string[];
  metadata?: {
    executionTime?: number;
    queueTime?: number;
    warnings?: string[];
  };
}

export class SandboxManager {
  private pool: SandboxPool;
  private requestCounter = 0;
  private initialized = false;

  constructor(pool?: SandboxPool) {
    this.pool = pool || sandboxPool;
  }

  /**
   * Initialize sandbox manager
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    await this.pool.initialize();
    this.initialized = true;
    console.log('✅ SandboxManager initialized');
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${++this.requestCounter}`;
  }

  /**
   * Validate code for security
   */
  private validateCode(code: string): { valid: boolean; error?: string } {
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(code)) {
        return {
          valid: false,
          error: `Blocked pattern detected: ${pattern.source}`,
        };
      }
    }
    return { valid: true };
  }

  /**
   * Execute JavaScript code in sandbox
   */
  async execute(code: string, options: ExecuteOptions = {}): Promise<ExecuteResult> {
    await this.initialize();

    // Validate code
    const validation = this.validateCode(code);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
        metadata: { warnings: ['Code validation failed'] },
      };
    }

    // Prepare context (read-only scene by default)
    const context: SerializableContext = {
      ...options.context,
    };

    if (options.context?.scene && !options.allowSceneModification) {
      // Deep clone to prevent modifications
      context.scene = JSON.parse(JSON.stringify(options.context.scene));
    }

    // Create request
    const request: SandboxRequest = {
      id: this.generateRequestId(),
      type: 'execute',
      code,
      context,
      timeout: options.timeout || 5000,
      returnType: options.returnType || 'value',
    };

    // Execute in sandbox
    const response = await this.pool.execute(request);

    // Transform response to ExecuteResult
    return this.transformResponse(response);
  }

  /**
   * Execute code that generates scene objects
   */
  async executeObjectGenerator(
    code: string,
    params: Record<string, unknown> = {},
    scene?: unknown,
    timeout?: number
  ): Promise<ExecuteResult> {
    return this.execute(code, {
      timeout: timeout || 5000,
      returnType: 'objects',
      context: {
        params,
        scene,
      },
    });
  }

  /**
   * Execute code that generates complete scene
   */
  async executeSceneGenerator(
    code: string,
    params: Record<string, unknown> = {},
    timeout?: number
  ): Promise<ExecuteResult> {
    return this.execute(code, {
      timeout: timeout || 10000,
      returnType: 'scene',
      context: { params },
    });
  }

  /**
   * Execute batch of code snippets in parallel
   */
  async executeBatch(
    items: Array<{ code: string; options?: ExecuteOptions }>
  ): Promise<ExecuteResult[]> {
    await this.initialize();

    const requests: SandboxRequest[] = items.map((item) => ({
      id: this.generateRequestId(),
      type: 'execute',
      code: item.code,
      context: item.options?.context || {},
      timeout: item.options?.timeout || 5000,
      returnType: item.options?.returnType || 'value',
    }));

    const responses = await this.pool.executeBatch(requests);
    return responses.map((r) => this.transformResponse(r));
  }

  /**
   * Transform sandbox response to execute result
   */
  private transformResponse(response: SandboxResponse): ExecuteResult {
    if (!response.success) {
      return {
        success: false,
        error: response.error,
        console: response.console,
        metadata: {
          executionTime: response.metrics?.executionTime,
          queueTime: response.metrics?.queueTime,
          warnings: ['Execution failed'],
        },
      };
    }

    return {
      success: true,
      data: {
        result: response.result,
        animations: response.animations,
        returnType: 'value',
      },
      console: response.console,
      metadata: {
        executionTime: response.metrics?.executionTime,
        queueTime: response.metrics?.queueTime,
      },
    };
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return this.pool.getStats();
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.pool.cleanup();
  }

  /**
   * Terminate manager
   */
  terminate(): void {
    this.pool.terminate();
    this.initialized = false;
  }
}

// Singleton instance
export const sandboxManager = new SandboxManager();
