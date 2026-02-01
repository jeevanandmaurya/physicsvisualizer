/**
 * Simulator - Simulates actions before execution
 * 
 * Provides:
 * - Action preview/dry-run
 * - Impact assessment
 * - Warning/error detection
 * - Rollback points
 */

import type { AgentAction, AgentContext, SimulationResult } from '../types';

export class Simulator {
  private isInitialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;
  }

  /**
   * Simulate an action and return preview of results
   */
  async simulate(action: AgentAction, context: AgentContext): Promise<SimulationResult> {
    const warnings: string[] = [];
    const errors: string[] = [];

    switch (action.type) {
      case 'scene_create':
        return this.simulateSceneCreate(action, context, warnings, errors);
      
      case 'scene_edit':
        return this.simulateSceneEdit(action, context, warnings, errors);
      
      case 'tool_call':
        return this.simulateToolCall(action, context, warnings, errors);
      
      case 'chat':
        return {
          success: true,
          preview: { message: action.message },
          warnings: [],
          errors: [],
          estimatedImpact: {
            objectsAffected: 0,
            propertiesChanged: [],
            isDestructive: false
          }
        };
      
      default:
        return {
          success: false,
          preview: null,
          warnings: [],
          errors: ['Unknown action type'],
          estimatedImpact: {
            objectsAffected: 0,
            propertiesChanged: [],
            isDestructive: false
          }
        };
    }
  }

  /**
   * Simulate scene creation
   */
  private simulateSceneCreate(
    action: AgentAction, 
    context: AgentContext,
    warnings: string[],
    errors: string[]
  ): SimulationResult {
    const scene = action.scene;

    if (!scene) {
      errors.push('No scene data provided');
      return this.createResult(false, null, warnings, errors, 0, [], true);
    }

    // Validate scene structure
    if (!scene.objects || !Array.isArray(scene.objects)) {
      warnings.push('Scene has no objects array');
    }

    const objectCount = scene.objects?.length || 0;
    
    // Warn about large scenes
    if (objectCount > 100) {
      warnings.push(`Large scene with ${objectCount} objects may impact performance`);
    }

    // Check for physics issues
    if (scene.objects) {
      const overlapping = this.detectOverlappingObjects(scene.objects);
      if (overlapping > 0) {
        warnings.push(`${overlapping} potentially overlapping objects detected`);
      }
    }

    // Check if replacing existing scene
    const isDestructive = context.scene && context.scene.objects?.length > 0;
    if (isDestructive) {
      warnings.push('This will replace the existing scene');
    }

    return this.createResult(
      errors.length === 0,
      { scene, objectCount },
      warnings,
      errors,
      objectCount,
      ['scene'],
      isDestructive
    );
  }

  /**
   * Simulate scene edit with patches
   */
  private simulateSceneEdit(
    action: AgentAction,
    context: AgentContext,
    warnings: string[],
    errors: string[]
  ): SimulationResult {
    const patches = action.patches || [];

    if (!context.scene) {
      errors.push('No scene to edit');
      return this.createResult(false, null, warnings, errors, 0, [], false);
    }

    if (patches.length === 0) {
      warnings.push('No patches to apply');
      return this.createResult(true, context.scene, warnings, errors, 0, [], false);
    }

    // Analyze patches
    const affectedPaths = new Set<string>();
    let objectsAffected = 0;
    let hasDeleteOps = false;

    for (const patch of patches) {
      affectedPaths.add(patch.path);
      
      if (patch.path?.includes('/objects/')) {
        objectsAffected++;
      }
      
      if (patch.op === 'remove') {
        hasDeleteOps = true;
      }

      // Validate path exists
      if (!this.pathExists(context.scene, patch.path)) {
        if (patch.op !== 'add') {
          warnings.push(`Path does not exist: ${patch.path}`);
        }
      }
    }

    return this.createResult(
      errors.length === 0,
      { patchCount: patches.length, affectedPaths: Array.from(affectedPaths) },
      warnings,
      errors,
      objectsAffected,
      Array.from(affectedPaths),
      hasDeleteOps
    );
  }

  /**
   * Simulate tool call
   */
  private simulateToolCall(
    action: AgentAction,
    _context: AgentContext,
    warnings: string[],
    errors: string[]
  ): SimulationResult {
    const tool = action.tool;
    const params = action.parameters || {};

    if (!tool) {
      errors.push('No tool specified');
      return this.createResult(false, null, warnings, errors, 0, [], false);
    }

    // Check for potentially dangerous tools
    const destructiveTools = ['clear_scene', 'delete_all', 'reset'];
    if (destructiveTools.some(t => tool.includes(t))) {
      warnings.push(`Tool "${tool}" may be destructive`);
    }

    // Check for code execution
    if (tool.includes('execute') || tool.includes('run')) {
      if (params.code) {
        const codeLength = params.code.length;
        if (codeLength > 5000) {
          warnings.push(`Large code block (${codeLength} chars) may take time to execute`);
        }
        
        // Check for infinite loop patterns
        if (this.detectInfiniteLoopRisk(params.code)) {
          warnings.push('Code may contain infinite loop risk');
        }
      }
    }

    // Estimate impact based on tool type
    const isCreationTool = tool.includes('generate') || tool.includes('create');
    const estimatedObjects = isCreationTool ? (params.count || params.objectCount || 10) : 0;

    return this.createResult(
      errors.length === 0,
      { tool, parameters: params },
      warnings,
      errors,
      estimatedObjects,
      isCreationTool ? ['objects'] : [],
      false
    );
  }

  /**
   * Detect overlapping objects (simple check)
   */
  private detectOverlappingObjects(objects: any[]): number {
    let overlapping = 0;
    const positions = new Map<string, number>();

    for (const obj of objects) {
      if (!obj.position) continue;
      const key = obj.position.map((v: number) => Math.round(v)).join(',');
      const count = positions.get(key) || 0;
      if (count > 0) overlapping++;
      positions.set(key, count + 1);
    }

    return overlapping;
  }

  /**
   * Check if JSON path exists in object
   */
  private pathExists(obj: any, path: string): boolean {
    if (!path || path === '/') return true;
    
    const parts = path.split('/').filter(Boolean);
    let current = obj;
    
    for (const part of parts) {
      if (part === '-') return true; // Array append
      if (current === null || current === undefined) return false;
      if (typeof current !== 'object') return false;
      
      const key = part.match(/^\d+$/) ? parseInt(part) : part;
      if (!(key in current)) return false;
      current = current[key];
    }
    
    return true;
  }

  /**
   * Simple heuristic for infinite loop detection
   */
  private detectInfiniteLoopRisk(code: string): boolean {
    // Check for while(true) or for(;;) without break
    if (/while\s*\(\s*true\s*\)/.test(code) && !code.includes('break')) {
      return true;
    }
    if (/for\s*\(\s*;\s*;\s*\)/.test(code) && !code.includes('break')) {
      return true;
    }
    return false;
  }

  private createResult(
    success: boolean,
    preview: any,
    warnings: string[],
    errors: string[],
    objectsAffected: number,
    propertiesChanged: string[],
    isDestructive: boolean
  ): SimulationResult {
    return {
      success,
      preview,
      warnings,
      errors,
      estimatedImpact: {
        objectsAffected,
        propertiesChanged,
        isDestructive
      }
    };
  }
}
