/**
 * BuiltInTools - Register all built-in tools for the Physics Visualizer
 * These tools enable the AI agent to be more powerful than a simple chat app
 */

import { toolRegistry } from './ToolRegistry';
import { jsExecutor } from './JavaScriptExecutor';
import ScenePatcher from '../scene/patcher';

/**
 * Register all built-in tools
 */
export function registerBuiltInTools(): void {
  // Tool 1: Execute JavaScript Code
  toolRegistry.registerTool({
    name: 'execute_javascript',
    description: 'Execute JavaScript code to generate physics objects, perform calculations, or manipulate data. Returns the execution result.',
    category: 'execution',
    parameters: [
      {
        name: 'code',
        type: 'string',
        description: 'JavaScript code to execute. Can use Math, Vector3, Physics utilities. Return value will be captured.',
        required: true
      },
      {
        name: 'returnType',
        type: 'string',
        description: 'Expected return type: "value" (default), "objects" (array of scene objects), or "scene" (full scene)',
        required: false,
        default: 'value',
        enum: ['value', 'objects', 'scene']
      },
      {
        name: 'timeout',
        type: 'number',
        description: 'Execution timeout in milliseconds',
        required: false,
        default: 5000
      }
    ],
    examples: [
      'Generate 10 spheres in a circle: execute_javascript({ code: "const objects = []; for(let i=0; i<10; i++) { const angle = (i/10) * Math.PI * 2; objects.push({ id: `sphere_${i}`, type: \'Sphere\', position: [Math.cos(angle)*5, 2, Math.sin(angle)*5], radius: 0.5, mass: 1, color: \'#ff6347\' }); } return objects;", returnType: "objects" })',
      'Calculate kinetic energy: execute_javascript({ code: "return Physics.kineticEnergy(10, 5);", returnType: "value" })'
    ],
    executor: async (params, context) => {
      return await jsExecutor.executeCode(
        params.code,
        context,
        {
          returnType: params.returnType,
          timeout: params.timeout,
          allowSceneModification: false
        }
      );
    }
  });

  // Tool 2: Generate Scene Objects
  toolRegistry.registerTool({
    name: 'generate_scene_objects',
    description: 'Generate multiple physics objects using JavaScript code. Code should return an array of object definitions. Useful for creating complex patterns, grids, fractals, etc.',
    category: 'generation',
    parameters: [
      {
        name: 'code',
        type: 'string',
        description: 'JavaScript code that returns an array of scene objects. Each object should have: id, type, position, mass, etc.',
        required: true
      },
      {
        name: 'description',
        type: 'string',
        description: 'Human-readable description of what objects are being generated',
        required: false,
        default: 'Generated objects'
      }
    ],
    examples: [
      'Spiral of cubes: generate_scene_objects({ code: "const objects = []; for(let i=0; i<20; i++) { const t = i/19; const angle = t * 3 * Math.PI * 2; const r = 2 + t * 8; objects.push({ id: `cube_${i}`, type: \'Box\', position: [Math.cos(angle)*r, t*10, Math.sin(angle)*r], dimensions: [0.5,0.5,0.5], mass: 1, color: `hsl(${t*360}, 70%, 50%)` }); } return objects;" })',
      'Hexagonal grid: generate_scene_objects({ code: "const objects = []; const rings = 3; for(let q=-rings; q<=rings; q++) { for(let r=Math.max(-rings,-q-rings); r<=Math.min(rings,-q+rings); r++) { const x = (Math.sqrt(3)*q + Math.sqrt(3)/2*r) * 2; const z = (3/2*r) * 2; objects.push({ id: `hex_${q}_${r}`, type: \'Cylinder\', position: [x, 2, z], radius: 0.8, height: 1, mass: 1, rotation: [Math.PI/2,0,0], color: \'#32cd32\' }); }} return objects;" })'
    ],
    executor: async (params, context) => {
      return await jsExecutor.generateObjects(params.code, context);
    }
  });

  // Tool 3: Generate Complete Scene
  toolRegistry.registerTool({
    name: 'generate_complete_scene',
    description: 'Generate a complete physics scene using JavaScript code. Code should return a full scene object with id, name, objects, gravity, etc.',
    category: 'generation',
    parameters: [
      {
        name: 'code',
        type: 'string',
        description: 'JavaScript code that returns a complete scene object',
        required: true
      },
      {
        name: 'sceneId',
        type: 'string',
        description: 'Unique identifier for the scene',
        required: false
      }
    ],
    examples: [
      'Bouncing balls scene: generate_complete_scene({ code: "return { id: \'bouncing_balls\', name: \'Bouncing Balls\', description: \'Multiple balls bouncing on ground\', objects: Array.from({length: 5}, (_, i) => ({ id: `ball_${i}`, type: \'Sphere\', position: [i*2-4, 5+i*2, 0], radius: 0.5, mass: 1, color: `hsl(${i*72}, 70%, 50%)`, velocity: [0, 0, 0] })), gravity: [0, -9.81, 0], hasGround: true, contactMaterial: { friction: 0.5, restitution: 0.8 } };" })'
    ],
    executor: async (params, context) => {
      return await jsExecutor.generateScene(params.code, context);
    }
  });

  // Tool 4: Apply JSON Patches to Scene

  // Tool 4: Apply JSON Patches to Scene
  toolRegistry.registerTool({
    name: 'apply_scene_patches',
    description: 'Apply JSON patch operations to modify the current scene. Use for precise modifications.',
    category: 'scene',
    parameters: [
      {
        name: 'patches',
        type: 'array',
        description: 'Array of JSON patch operations (add, remove, replace)',
        required: true
      }
    ],
    examples: [
      'Add object: apply_scene_patches({ patches: [{ op: "add", path: "/objects/-", value: { id: "ball", type: "Sphere", position: [0,5,0], mass: 1, radius: 0.5 } }] })',
      'Change gravity: apply_scene_patches({ patches: [{ op: "replace", path: "/gravity/1", value: -15 }] })'
    ],
    executor: async (params, context) => {
      if (!context.scene) {
        return {
          success: false,
          error: 'No scene available to patch'
        };
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
  });

}

export default registerBuiltInTools;
