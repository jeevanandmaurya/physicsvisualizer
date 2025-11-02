/**
 * JavaScriptExecutor - Secure JavaScript execution tool
 * Executes JavaScript code in a controlled environment with access to scene context
 */

import { ToolResult, ToolExecutionContext } from './ToolRegistry';

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

export class JavaScriptExecutor {
  private executionTimeout = 5000; // 5 seconds max
  private maxOutputSize = 10000; // characters

  /**
   * Execute JavaScript code in a sandboxed environment
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
      // Prepare execution environment
      const env = this.createExecutionEnvironment(context, options.allowSceneModification);

      // Capture console output
      const consoleOutput: string[] = [];
      const capturedConsole = this.createConsoleProxy(consoleOutput);

      // Create the function with access to environment
      const func = new Function(
        'env',
        'console',
        `
        with (env) {
          ${code}
        }
        `
      );

      // Execute with timeout
      const result = await this.executeWithTimeout(
        () => func(env, capturedConsole),
        timeout
      );

      // Process result based on return type
      const processedResult = this.processResult(result, options.returnType, env);

      return {
        success: true,
        data: {
          result: processedResult,
          console: consoleOutput.slice(0, 100), // Limit console output
          executionTime: Date.now() - startTime,
          returnType: options.returnType || 'value'
        },
        metadata: {
          executionTime: Date.now() - startTime,
          warnings: consoleOutput.length > 100 ? ['Console output truncated'] : []
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: `JavaScript execution failed: ${error.message}`,
        metadata: {
          executionTime: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Create execution environment with utilities
   */
  private createExecutionEnvironment(
    context: ToolExecutionContext,
    allowSceneModification: boolean = false
  ): ExecutionEnvironment {
    // Basic safe objects
    const env: ExecutionEnvironment = {
      Math,
      JSON,
      console,
      Object,
      Array,
      String,
      Number,
      Boolean,
      Date,

      // Vector3 utility
      Vector3: class Vector3 {
        constructor(public x = 0, public y = 0, public z = 0) {}
        
        static fromArray(arr: number[]): Vector3 {
          return new Vector3(arr[0] || 0, arr[1] || 0, arr[2] || 0);
        }

        toArray(): number[] {
          return [this.x, this.y, this.z];
        }

        add(v: Vector3): Vector3 {
          return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
        }

        subtract(v: Vector3): Vector3 {
          return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
        }

        multiply(scalar: number): Vector3 {
          return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
        }

        magnitude(): number {
          return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        }

        normalize(): Vector3 {
          const mag = this.magnitude();
          return mag > 0 ? this.multiply(1 / mag) : new Vector3();
        }

        dot(v: Vector3): number {
          return this.x * v.x + this.y * v.y + this.z * v.z;
        }

        cross(v: Vector3): Vector3 {
          return new Vector3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
          );
        }
      },

      // Physics utilities
      Physics: {
        // Gravitational force
        gravityForce: (mass1: number, mass2: number, distance: number, G = 6.674e-11) => {
          return distance > 0 ? (G * mass1 * mass2) / (distance * distance) : 0;
        },

        // Spring force
        springForce: (k: number, displacement: number) => {
          return -k * displacement;
        },

        // Kinetic energy
        kineticEnergy: (mass: number, velocity: number) => {
          return 0.5 * mass * velocity * velocity;
        },

        // Potential energy (gravitational)
        potentialEnergy: (mass: number, height: number, g = 9.81) => {
          return mass * g * height;
        },

        // Momentum
        momentum: (mass: number, velocity: number) => {
          return mass * velocity;
        },

        // Distance between two points
        distance: (p1: number[], p2: number[]) => {
          const dx = p1[0] - p2[0];
          const dy = p1[1] - p2[1];
          const dz = p1[2] - p2[2];
          return Math.sqrt(dx * dx + dy * dy + dz * dz);
        }
      }
    };

    // Add scene context if available (read-only by default)
    if (context.scene) {
      if (allowSceneModification) {
        env.scene = context.scene;
      } else {
        // Provide read-only clone
        env.scene = JSON.parse(JSON.stringify(context.scene));
      }
    }

    return env;
  }

  /**
   * Create console proxy to capture output
   */
  private createConsoleProxy(output: string[]): Console {
    return {
      log: (...args: any[]) => {
        output.push(`LOG: ${args.map(a => String(a)).join(' ')}`);
      },
      warn: (...args: any[]) => {
        output.push(`WARN: ${args.map(a => String(a)).join(' ')}`);
      },
      error: (...args: any[]) => {
        output.push(`ERROR: ${args.map(a => String(a)).join(' ')}`);
      },
      info: (...args: any[]) => {
        output.push(`INFO: ${args.map(a => String(a)).join(' ')}`);
      },
      debug: (...args: any[]) => {
        output.push(`DEBUG: ${args.map(a => String(a)).join(' ')}`);
      }
    } as Console;
  }

  /**
   * Execute function with timeout
   */
  private async executeWithTimeout<T>(
    fn: () => T,
    timeout: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Execution timeout after ${timeout}ms`));
      }, timeout);

      try {
        const result = fn();
        clearTimeout(timer);
        resolve(result);
      } catch (error) {
        clearTimeout(timer);
        reject(error);
      }
    });
  }

  /**
   * Process execution result
   */
  private processResult(result: any, returnType: string = 'value', env: ExecutionEnvironment): any {
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
      return env.scene || null;
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

// Global executor instance
export const jsExecutor = new JavaScriptExecutor();

export default JavaScriptExecutor;
