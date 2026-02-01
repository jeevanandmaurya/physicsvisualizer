/**
 * CodeExecutor - Secure JavaScript execution in sandboxed Web Workers
 * Executes AI-generated code, tool functions, and user scripts
 * Uses SharedArrayBuffer for fast communication when available
 */

import { sandboxManager } from './SandboxManager';

// Local type definitions (no external dependency)
export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    executionTime?: number;
    resourcesUsed?: string[];
    warnings?: string[];
  };
}

export interface ToolExecutionContext {
  scene?: any;
  chatHistory?: any[];
  workspace?: any;
  params?: Record<string, unknown>;
  time?: number;
  dt?: number;
  input?: unknown;
  player?: unknown;
}

export interface ExecutionEnvironment {
  Math: typeof Math;
  JSON: typeof JSON;
  console: Console;
  Object: typeof Object;
  Array: typeof Array;
  String: typeof String;
  Number: typeof Number;
  Boolean: typeof Boolean;
  Date: typeof Date;
  // Custom physics utilities
  Vector3: any;
  Physics: any;
  // Scene access
  scene?: any;
}

export class CodeExecutor {
  private executionTimeout = 5000; // 5 seconds max
  private maxOutputSize = 10000; // characters
  private initialized = false;

  /**
   * Initialize sandbox (called automatically on first use)
   */
  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    await sandboxManager.initialize();
    this.initialized = true;
  }

  /**
   * Execute JavaScript code in a sandboxed Web Worker
   */
  async executeCode(
    code: string,
    context: ToolExecutionContext,
    options: {
      timeout?: number;
      returnType?: 'value' | 'objects' | 'scene';
      allowSceneModification?: boolean;
    } = {}
  ): Promise<ToolResult> {
    const startTime = Date.now();
    const timeout = options.timeout || this.executionTimeout;

    try {
      await this.ensureInitialized();

      // Execute in sandbox
      const result = await sandboxManager.execute(code, {
        timeout,
        returnType: options.returnType || 'value',
        context: {
          scene: context.scene,
          params: context.params || {},
          time: context.time,
          dt: context.dt,
          input: context.input,
          player: context.player,
        },
        allowSceneModification: options.allowSceneModification,
      });

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Execution failed',
          metadata: {
            executionTime: result.metadata?.executionTime || Date.now() - startTime,
          },
        };
      }

      // Process result based on return type
      const processedResult = this.processResult(result.data?.result, options.returnType);

      return {
        success: true,
        data: {
          result: processedResult,
          console: result.console || [],
          executionTime: result.metadata?.executionTime || Date.now() - startTime,
          returnType: options.returnType || 'value',
        },
        metadata: {
          executionTime: result.metadata?.executionTime || Date.now() - startTime,
          warnings: result.metadata?.warnings || [],
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: `JavaScript execution failed: ${error.message}`,
        metadata: {
          executionTime: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * Process execution result based on return type
   * Environment is now handled by the sandbox worker
   */
  private processResult(result: any, returnType: string = 'value'): any {
    if (returnType === 'objects') {
      // Expected to return array of scene objects
      if (Array.isArray(result)) {
        return result.map(obj => this.validateSceneObject(obj));
      } else if (result && typeof result === 'object') {
        return [this.validateSceneObject(result)];
      }
      return [];
    } else if (returnType === 'scene') {
      // Expected to return full scene
      if (result && typeof result === 'object' && result.id && result.name) {
        return result;
      }
      return null;
    } else {
      // Return raw value
      return result;
    }
  }



  /**
   * Validate and normalize scene object
   */
  private validateSceneObject(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return null;
    }

    return {
      id: obj.id || `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: obj.type || 'Sphere',
      mass: obj.mass ?? 1,
      position: Array.isArray(obj.position) ? obj.position : [0, 0, 0],
      velocity: Array.isArray(obj.velocity) ? obj.velocity : [0, 0, 0],
      rotation: Array.isArray(obj.rotation) ? obj.rotation : [0, 0, 0],
      radius: obj.radius ?? (obj.type === 'Sphere' ? 0.5 : undefined),
      dimensions: obj.dimensions,
      height: obj.height,
      color: obj.color || '#888888',
      opacity: obj.opacity ?? 1.0,
      isStatic: obj.isStatic ?? false,
      restitution: obj.restitution ?? 0.7,
      friction: obj.friction ?? 0.5,
      ...obj // Keep any additional properties
    };
  }

  /**
   * Generate objects using code
   */
  async generateObjects(
    code: string,
    context: ToolExecutionContext,
    timeout?: number
  ): Promise<ToolResult> {
    return this.executeCode(code, context, {
      timeout,
      returnType: 'objects',
      allowSceneModification: false
    });
  }

  /**
   * Generate complete scene using code
   */
  async generateScene(
    code: string,
    context: ToolExecutionContext,
    timeout?: number
  ): Promise<ToolResult> {
    return this.executeCode(code, context, {
      timeout,
      returnType: 'scene',
      allowSceneModification: false
    });
  }
}

// Global executor instance (aliased for backward compatibility)
export const codeExecutor = new CodeExecutor();
export const jsExecutor = codeExecutor; // Backward compatibility alias

export default CodeExecutor;
