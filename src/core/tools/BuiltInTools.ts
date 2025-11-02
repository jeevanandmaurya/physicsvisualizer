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

  // Tool 4: Analyze Scene Physics
  toolRegistry.registerTool({
    name: 'analyze_scene_physics',
    description: 'Analyze the current scene to calculate total energy, momentum, center of mass, etc. Returns physics analysis data.',
    category: 'analysis',
    parameters: [
      {
        name: 'analysisType',
        type: 'string',
        description: 'Type of analysis to perform',
        required: false,
        default: 'comprehensive',
        enum: ['comprehensive', 'energy', 'momentum', 'forces', 'stability']
      }
    ],
    examples: [
      'Comprehensive analysis: analyze_scene_physics({ analysisType: "comprehensive" })'
    ],
    executor: async (params, context) => {
      if (!context.scene || !context.scene.objects) {
        return {
          success: false,
          error: 'No scene available for analysis'
        };
      }

      const scene = context.scene;
      const objects = scene.objects || [];
      
      const analysis: any = {
        objectCount: objects.length,
        timestamp: new Date().toISOString()
      };

      // Energy analysis
      if (params.analysisType === 'comprehensive' || params.analysisType === 'energy') {
        let totalKineticEnergy = 0;
        let totalPotentialEnergy = 0;

        objects.forEach((obj: any) => {
          if (!obj.isStatic && obj.mass) {
            const v = obj.velocity || [0, 0, 0];
            const velocity = Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2);
            totalKineticEnergy += 0.5 * obj.mass * velocity * velocity;

            const y = obj.position ? obj.position[1] : 0;
            const g = scene.gravity ? Math.sqrt(scene.gravity[0]**2 + scene.gravity[1]**2 + scene.gravity[2]**2) : 0;
            totalPotentialEnergy += obj.mass * g * y;
          }
        });

        analysis.energy = {
          kinetic: totalKineticEnergy,
          potential: totalPotentialEnergy,
          total: totalKineticEnergy + totalPotentialEnergy
        };
      }

      // Momentum analysis
      if (params.analysisType === 'comprehensive' || params.analysisType === 'momentum') {
        const totalMomentum = [0, 0, 0];
        let totalMass = 0;

        objects.forEach((obj: any) => {
          if (!obj.isStatic && obj.mass) {
            const v = obj.velocity || [0, 0, 0];
            totalMomentum[0] += obj.mass * v[0];
            totalMomentum[1] += obj.mass * v[1];
            totalMomentum[2] += obj.mass * v[2];
            totalMass += obj.mass;
          }
        });

        analysis.momentum = {
          total: totalMomentum,
          magnitude: Math.sqrt(totalMomentum[0]**2 + totalMomentum[1]**2 + totalMomentum[2]**2),
          totalMass
        };
      }

      // Center of mass
      if (params.analysisType === 'comprehensive') {
        const com = [0, 0, 0];
        let totalMass = 0;

        objects.forEach((obj: any) => {
          if (obj.mass) {
            const pos = obj.position || [0, 0, 0];
            com[0] += obj.mass * pos[0];
            com[1] += obj.mass * pos[1];
            com[2] += obj.mass * pos[2];
            totalMass += obj.mass;
          }
        });

        if (totalMass > 0) {
          com[0] /= totalMass;
          com[1] /= totalMass;
          com[2] /= totalMass;
        }

        analysis.centerOfMass = com;
      }

      return {
        success: true,
        data: analysis
      };
    }
  });

  // Tool 5: Create Three.js HTML Preview
  toolRegistry.registerTool({
    name: 'create_threejs_preview',
    description: 'Generate a standalone HTML file with Three.js scene that can be previewed. Useful for creating custom visualizations beyond the standard physics scenes.',
    category: 'generation',
    parameters: [
      {
        name: 'threeJsCode',
        type: 'string',
        description: 'Three.js scene code. Will be wrapped in HTML template. Use `scene`, `camera`, `renderer` variables.',
        required: true
      },
      {
        name: 'title',
        type: 'string',
        description: 'HTML page title',
        required: false,
        default: 'Three.js Preview'
      },
      {
        name: 'includeControls',
        type: 'boolean',
        description: 'Include OrbitControls',
        required: false,
        default: true
      }
    ],
    examples: [
      'Rotating cube: create_threejs_preview({ threeJsCode: "const geometry = new THREE.BoxGeometry(2, 2, 2); const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); const cube = new THREE.Mesh(geometry, material); scene.add(cube); function animate() { requestAnimationFrame(animate); cube.rotation.x += 0.01; cube.rotation.y += 0.01; renderer.render(scene, camera); } animate();" })'
    ],
    executor: async (params, context) => {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${params.title}</title>
    <style>
        body { margin: 0; overflow: hidden; font-family: Arial, sans-serif; }
        canvas { display: block; }
        #info {
            position: absolute;
            top: 10px;
            left: 10px;
            color: white;
            background: rgba(0,0,0,0.7);
            padding: 10px;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div id="info">${params.title}</div>
    <script type="importmap">
    {
        "imports": {
            "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
            "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
        }
    }
    </script>
    <script type="module">
        import * as THREE from 'three';
        ${params.includeControls ? `import { OrbitControls } from 'three/addons/controls/OrbitControls.js';` : ''}

        // Setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a2e);
        
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(5, 5, 5);
        
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        
        ${params.includeControls ? `
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        ` : ''}
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 10);
        scene.add(directionalLight);
        
        // User code
        ${params.threeJsCode}
        
        // Handle resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    </script>
</body>
</html>`;

      return {
        success: true,
        data: {
          html,
          title: params.title
        }
      };
    }
  });

  // Tool 6: Multi-step Workflow Executor
  toolRegistry.registerTool({
    name: 'execute_workflow',
    description: 'Execute multiple tools in sequence, passing results between steps. Enables complex multi-step operations.',
    category: 'workflow',
    parameters: [
      {
        name: 'steps',
        type: 'array',
        description: 'Array of workflow steps, each with tool name and parameters',
        required: true
      },
      {
        name: 'description',
        type: 'string',
        description: 'Description of the workflow',
        required: false,
        default: 'Multi-step workflow'
      }
    ],
    examples: [
      'Generate and analyze: execute_workflow({ steps: [{ tool: "generate_scene_objects", params: {...} }, { tool: "analyze_scene_physics", params: {...} }] })'
    ],
    executor: async (params, context) => {
      const results: any[] = [];
      let currentContext = { ...context };

      for (let i = 0; i < params.steps.length; i++) {
        const step = params.steps[i];
        
        try {
          const result = await toolRegistry.executeTool(
            step.tool,
            step.params || {},
            currentContext
          );

          results.push({
            step: i + 1,
            tool: step.tool,
            success: result.success,
            data: result.data,
            error: result.error
          });

          // Update context with result for next step
          if (result.success && result.data) {
            if (result.data.result && Array.isArray(result.data.result)) {
              // Add generated objects to scene
              currentContext.scene = currentContext.scene || { objects: [] };
              currentContext.scene.objects = [
                ...(currentContext.scene.objects || []),
                ...result.data.result
              ];
            } else if (result.data.result && result.data.result.id) {
              // Replace scene
              currentContext.scene = result.data.result;
            }
          }

          if (!result.success) {
            break; // Stop on error
          }
        } catch (error: any) {
          results.push({
            step: i + 1,
            tool: step.tool,
            success: false,
            error: error.message
          });
          break;
        }
      }

      const allSuccess = results.every(r => r.success);

      return {
        success: allSuccess,
        data: {
          steps: results,
          finalScene: currentContext.scene
        },
        metadata: {
          executionTime: 0,
          resourcesUsed: [`${params.steps.length} workflow steps`],
          warnings: allSuccess ? [] : ['Some steps failed']
        }
      };
    }
  });

  // Tool 7: Apply JSON Patches to Scene
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

  console.log('✅ Registered all built-in tools');
}

export default registerBuiltInTools;
