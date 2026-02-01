/**
 * Built-in Tools - Direct tool execution without registry overhead
 * Tools execute code via sandboxed workers for security
 */

import { codeExecutor } from './CodeExecutor';
import ScenePatcher from '../../scene/patcher';

// Simple types (no external dependency)
export interface ToolContext {
  scene?: any;
  chatHistory?: any[];
  workspace?: any;
}

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

/**
 * Execute JavaScript code to generate physics objects or perform calculations
 */
export async function executeJavaScript(
  params: { code: string; returnType?: 'value' | 'objects' | 'scene'; timeout?: number },
  context: ToolContext
): Promise<ToolResult> {
  return await codeExecutor.executeCode(
    params.code,
    context,
    {
      returnType: params.returnType,
      timeout: params.timeout,
      allowSceneModification: false
    }
  );
}

/**
 * Generate multiple physics objects using JavaScript code
 */
export async function generateSceneObjects(
  params: { code: string; description?: string },
  context: ToolContext
): Promise<ToolResult> {
  return await codeExecutor.generateObjects(params.code, context);
}

/**
 * Generate a complete physics scene using JavaScript code
 */
export async function generateCompleteScene(
  params: { code: string; sceneId?: string },
  context: ToolContext
): Promise<ToolResult> {
  return await codeExecutor.generateScene(params.code, context);
}

/**
 * Apply JSON patch operations to modify the current scene
 */
export function applyScenePatches(
  params: { patches: any[] },
  context: ToolContext
): ToolResult {
  if (!context.scene) {
    return { success: false, error: 'No scene available to patch' };
  }

  const patcher = new ScenePatcher();
  const result = patcher.applyPatches(context.scene, params.patches);

  return {
    success: result.success,
    data: result.scene,
    error: result.error || undefined,
    metadata: {
      executionTime: 0,
      resourcesUsed: [`${result.appliedPatches} patches applied`],
      warnings: result.success ? [] : ['Patch application failed']
    }
  };
}

// Tool name aliases for AI compatibility
const TOOL_ALIASES: Record<string, string> = {
  'create_scene': 'generate_complete_scene',
  'create_scene_objects': 'generate_scene_objects',
  'apply_patches': 'apply_scene_patches',
};

/**
 * Execute a tool by name
 */
export async function executeTool(
  toolName: string,
  params: any,
  context: ToolContext
): Promise<ToolResult> {
  // Resolve aliases
  const resolved = TOOL_ALIASES[toolName] || toolName;

  switch (resolved) {
    case 'execute_javascript':
      return await executeJavaScript(params, context);
    case 'generate_scene_objects':
      return await generateSceneObjects(params, context);
    case 'generate_complete_scene':
      return await generateCompleteScene(params, context);
    case 'apply_scene_patches':
      return applyScenePatches(params, context);
    default:
      return { success: false, error: `Tool "${toolName}" not found` };
  }
}

/**
 * Check if a tool exists
 */
export function hasTool(toolName: string): boolean {
  const resolved = TOOL_ALIASES[toolName] || toolName;
  return ['execute_javascript', 'generate_scene_objects', 'generate_complete_scene', 'apply_scene_patches'].includes(resolved);
}
