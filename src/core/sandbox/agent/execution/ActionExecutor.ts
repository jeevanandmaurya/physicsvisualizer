/**
 * ActionExecutor - Executes planned actions
 * 
 * Handles:
 * - Tool execution
 * - Scene creation/modification
 * - Patch application
 * - Error handling and recovery
 */

import type { AgentAction, AgentContext, ExecutionResult } from '../types';
import { executeTool, hasTool } from '../../execution';
import ScenePatcher from '../../../scene/patcher';

export class ActionExecutor {
  private isInitialized: boolean = false;
  private scenePatcher: ScenePatcher | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    this.scenePatcher = new ScenePatcher();
    this.isInitialized = true;
  }

  /**
   * Execute a single action
   */
  async execute(action: AgentAction, context: AgentContext): Promise<ExecutionResult> {
    const startTime = performance.now();

    try {
      switch (action.type) {
        case 'tool_call':
          return await this.executeToolCall(action, context, startTime);

        case 'scene_create':
          return this.executeSceneCreate(action, context, startTime);

        case 'scene_edit':
          return this.executeSceneEdit(action, context, startTime);

        case 'chat':
          return {
            success: true,
            data: { message: action.message },
            executionTime: performance.now() - startTime,
            sideEffects: []
          };

        default:
          return {
            success: false,
            error: `Unknown action type: ${action.type}`,
            executionTime: performance.now() - startTime,
            sideEffects: []
          };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || String(error),
        executionTime: performance.now() - startTime,
        sideEffects: []
      };
    }
  }

  /**
   * Execute a tool call
   */
  private async executeToolCall(
    action: AgentAction, 
    context: AgentContext,
    startTime: number
  ): Promise<ExecutionResult> {
    const toolName = action.tool;
    const params = action.parameters || {};
    const sideEffects: string[] = [];

    if (!toolName) {
      return {
        success: false,
        error: 'No tool specified',
        executionTime: performance.now() - startTime,
        sideEffects
      };
    }

    // Check if tool exists
    if (!hasTool(toolName)) {
      return {
        success: false,
        error: `Tool not found: ${toolName}`,
        executionTime: performance.now() - startTime,
        sideEffects
      };
    }

    // Execute the tool
    const toolResult = await executeTool(toolName, params, { scene: context.scene });
    sideEffects.push(`Executed tool: ${toolName}`);

    if (!toolResult.success) {
      return {
        success: false,
        error: toolResult.error || 'Tool execution failed',
        executionTime: performance.now() - startTime,
        sideEffects
      };
    }

    // Process tool result
    const result = toolResult.data?.result;
    
    // If tool returns a full scene
    if (result?.id && result?.objects) {
      sideEffects.push('Created new scene');
      return {
        success: true,
        data: { scene: result, modifications: [] },
        executionTime: performance.now() - startTime,
        sideEffects
      };
    }

    // If tool returns objects array
    if (Array.isArray(result)) {
      const patches = result.map((obj: any) => ({
        op: 'add',
        path: '/objects/-',
        value: obj
      }));
      
      const updated = this.applyPatches(context.scene, patches);
      sideEffects.push(`Added ${result.length} objects`);
      
      return {
        success: true,
        data: { scene: updated, modifications: patches },
        executionTime: performance.now() - startTime,
        sideEffects
      };
    }

    // Other tool results
    return {
      success: true,
      data: { result, scene: context.scene },
      executionTime: performance.now() - startTime,
      sideEffects
    };
  }

  /**
   * Execute scene creation
   */
  private executeSceneCreate(
    action: AgentAction,
    _context: AgentContext,
    startTime: number
  ): ExecutionResult {
    const scene = action.scene;

    if (!scene) {
      return {
        success: false,
        error: 'No scene data provided',
        executionTime: performance.now() - startTime,
        sideEffects: []
      };
    }

    // Validate and normalize scene
    const normalizedScene = this.normalizeScene(scene);

    return {
      success: true,
      data: { scene: normalizedScene, modifications: [] },
      executionTime: performance.now() - startTime,
      sideEffects: ['Created new scene']
    };
  }

  /**
   * Execute scene edit with patches
   */
  private executeSceneEdit(
    action: AgentAction,
    context: AgentContext,
    startTime: number
  ): ExecutionResult {
    const patches = action.patches || [];

    if (!context.scene) {
      return {
        success: false,
        error: 'No scene to edit',
        executionTime: performance.now() - startTime,
        sideEffects: []
      };
    }

    if (patches.length === 0) {
      return {
        success: true,
        data: { scene: context.scene, modifications: [] },
        executionTime: performance.now() - startTime,
        sideEffects: []
      };
    }

    const updatedScene = this.applyPatches(context.scene, patches);

    return {
      success: true,
      data: { scene: updatedScene, modifications: patches },
      executionTime: performance.now() - startTime,
      sideEffects: [`Applied ${patches.length} patches`]
    };
  }

  /**
   * Apply JSON patches to scene
   */
  private applyPatches(scene: any, patches: any[]): any {
    if (!this.scenePatcher) {
      this.scenePatcher = new ScenePatcher();
    }
    
    const result = this.scenePatcher.applyPatches(scene, patches);
    return result.success ? result.scene : scene;
  }

  /**
   * Normalize scene structure
   */
  private normalizeScene(scene: any, _context?: AgentContext): any {
    return {
      id: scene.id || `scene_${Date.now()}`,
      name: scene.name || 'Untitled Scene',
      description: scene.description || '',
      objects: scene.objects || [],
      gravity: scene.gravity ?? [0, -9.81, 0],
      hasGround: scene.hasGround ?? true,
      contactMaterial: scene.contactMaterial || {
        friction: 0.3,
        restitution: 0.3
      },
      camera: scene.camera || {
        position: [10, 10, 10],
        target: [0, 0, 0]
      },
      functionCalls: scene.functionCalls || [],
      ...scene
    };
  }
}
