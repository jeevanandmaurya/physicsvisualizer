/**
 * FunctionCallSystem - Dynamic function calling and execution system
 * Allows defining JavaScript functions and calling them from scenes and configurations
 */

export class FunctionCallSystem {
  constructor() {
    this.functions = {};
    this.context = {};
    this.wasmModules = {};
    this.generators = {}; // Scene object generators
  }

  /**
   * Define a JavaScript function
   * @param {string} name - Function name
   * @param {Function|string} func - Function definition or string
   * @param {Object} options - Function options
   */
  defineFunction(name, func, options = {}) {
    if (typeof func === 'string') {
      // Compile string function
      try {
        func = new Function('args', 'context', 'scene', 'system', `return (${func})(args, context, scene, system)`);
      } catch (error) {
        console.error(`Error compiling function ${name}:`, error);
        return false;
      }
    }

    this.functions[name] = {
      func,
      options,
      registeredAt: Date.now()
    };

    return true;
  }

  /**
   * Call a defined function
   * @param {string} name - Function name
   * @param {Array} args - Arguments to pass
   * @param {Object} scene - Current scene context
   * @returns {*} Function result
   */
  callFunction(name, args = [], scene = null) {
    const funcDef = this.functions[name];
    if (!funcDef) {
      console.warn(`Function ${name} not found`);
      return null;
    }

    try {
      return funcDef.func(args, this.context, scene, this);
    } catch (error) {
      console.error(`Error calling function ${name}:`, error);
      return null;
    }
  }

  /**
   * Evaluate an expression with function calls
   * @param {string} expression - Expression to evaluate (e.g., "distance({1,2,3}, {4,5,6}) + sin(time)")
   * @param {Object} scene - Current scene context
   * @returns {*} Expression result
   */
  evaluateExpression(expression, scene = null) {
    // Replace function calls with function executing code
    const processedExpression = expression.replace(/(\w+)\s*\(/g, 'system.callFunction("$1", [').replace(/\)/g, '], scene)');

    try {
      return new Function('system', 'scene', 'context', 'time', `return ${processedExpression}`)(
        this, scene, this.context, scene?.simulationTime || 0
      );
    } catch (error) {
      console.error(`Error evaluating expression "${expression}":`, error);
      return null;
    }
  }

  /**
   * Set context variables
   * @param {Object} context - Context variables
   */
  setContext(context) {
    this.context = { ...this.context, ...context };
  }

  /**
   * Load a WASM module (prepared for future implementation)
   * @param {string} name - Module name
   * @param {string} url - WASM file URL
   */
  async loadWasmModule(name, url) {
    // TODO: Implement WASM loading and integration
    console.log(`WASM loading prepared for ${name} from ${url}`);
    this.wasmModules[name] = { url, loaded: false };
  }

  /**
   * Execute WASM function
   * @param {string} module - Module name
   * @param {string} funcName - Function name
   * @param {*} args - Arguments
   */
  callWasmFunction(module, funcName, args) {
    // TODO: Implement WASM function calls
    console.log(`WASM call prepared: ${module}.${funcName}`, args);
    return null;
  }

  /**
   * Get list of defined functions
   */
  getFunctionList() {
    return Object.keys(this.functions);
  }

  /**
   * Process scene function calls and generate objects
   * @param {Object} scene - Scene object with functionCalls array
   * @returns {Object} Modified scene with generated objects
   */
  processSceneFunctions(scene) {
    if (!scene) return scene;

    // Clone the scene to avoid modifying the original
    const processedScene = JSON.parse(JSON.stringify(scene));
    processedScene.objects = processedScene.objects || [];
    processedScene.errors = processedScene.errors || [];

    // Process functionCalls array
    if (processedScene.functionCalls && Array.isArray(processedScene.functionCalls)) {
      console.log(`🎯 Processing ${processedScene.functionCalls.length} function calls for scene "${processedScene.id}"`);

      for (const functionCall of processedScene.functionCalls) {
        try {
          const objects = this.executeObjectGenerator(functionCall, processedScene);

          if (Array.isArray(objects)) {
            console.log(`✅ Generated ${objects.length} objects from function "${functionCall.name}"`);
            processedScene.objects.push(...objects);
          } else if (objects) {
            console.log(`✅ Generated 1 object from function "${functionCall.name}"`);
            processedScene.objects.push(objects);
          } else {
            console.warn(`⚠️ Function "${functionCall.name}" returned no objects`);
          }
        } catch (error) {
          const errorMsg = `Failed to execute function "${functionCall.name}": ${error.message}`;
          console.error(`❌ ${errorMsg}`);
          processedScene.errors.push(errorMsg);
        }
      }

      // Remove the processed functionCalls from the final scene
      delete processedScene.functionCalls;
    }

    return processedScene;
  }

  /**
   * Execute an object generator function
   * @param {Object} functionCall - Function call specification
   * @param {Object} scene - Current scene context
   * @returns {Array|Object|null} Generated objects
   */
  executeObjectGenerator(functionCall, scene) {
    const { name, parameters = {} } = functionCall;

    if (typeof name !== 'string' || !name) {
      throw new Error('Function call must have a valid "name" property');
    }

    const funcDef = this.generators[name] || this.functions[name];
    if (!funcDef) {
      throw new Error(`Object generator "${name}" not found`);
    }

    // Convert parameters object to args array for existing functions
    let args = [];
    if (funcDef.func.length >= 1) {
      // If function expects parameters object, pass it directly
      if (typeof parameters === 'object' && parameters !== null) {
        args = [parameters]; // Pass as single object argument
      } else {
        args = [parameters];
      }
    }

    // Execute the function
    const result = funcDef.func(args, this.context, scene, this);

    // Validate the result
    if (result === null || result === undefined) {
      return [];
    }

    if (Array.isArray(result)) {
      // Validate each object in the array
      return result.map(obj => this.validateGeneratedObject(obj, functionCall));
    } else if (typeof result === 'object') {
      // Single object result
      return this.validateGeneratedObject(result, functionCall);
    } else {
      console.warn(`Function "${name}" returned non-object result:`, result);
      return [];
    }
  }

  /**
   * Define an object generator function
   * @param {string} name - Generator name
   * @param {Function|string} func - Generator function or string
   * @param {Object} options - Generator options
   */
  defineObjectGenerator(name, func, options = {}) {
    if (typeof func === 'string') {
      // Compile string function with special wrapper for object generation
      try {
        func = new Function('parameters', 'context', 'scene', 'system', `
          try {
            return (${func})(parameters, context, scene, system);
          } catch (error) {
            console.error('Error in generator function "${name}":', error);
            return [];
          }
        `);
      } catch (error) {
        console.error(`Error compiling generator ${name}:`, error);
        return false;
      }
    }

    this.generators[name] = {
      func,
      options,
      registeredAt: Date.now()
    };

    return true;
  }

  /**
   * Validate a generated object
   * @param {Object} obj - Generated object
   * @param {Object} functionCall - Function call context
   * @returns {Object} Validated object
   */
  validateGeneratedObject(obj, functionCall) {
    if (!obj || typeof obj !== 'object') {
      throw new Error(`Generated object is not a valid object: ${obj}`);
    }

    // Ensure required properties
    if (!obj.id) {
      obj.id = `${functionCall.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    if (!obj.type) {
      obj.type = 'Sphere'; // Default type
    }

    // Ensure arrays for vectors
    if (obj.position && !Array.isArray(obj.position)) {
      obj.position = [obj.position, 0, 0];
    }

    if (obj.velocity && !Array.isArray(obj.velocity)) {
      obj.velocity = [obj.velocity, 0, 0];
    }

    if (obj.rotation && !Array.isArray(obj.rotation)) {
      obj.rotation = [obj.rotation, 0, 0];
    }

    // Set defaults
    obj.mass = obj.mass !== undefined ? obj.mass : 1;
    obj.position = obj.position || [0, 0, 0];
    obj.velocity = obj.velocity || [0, 0, 0];
    obj.rotation = obj.rotation || [0, 0, 0];

    return obj;
  }

  /**
   * Clear all functions
   */
  clear() {
    this.functions = {};
    this.context = {};
  }
}

// Global function call system instance
export const functionCallSystem = new FunctionCallSystem();

// Built-in utility functions
functionCallSystem.defineFunction('vectorMag', (args) => {
  const [x, y, z] = args;
  return Math.sqrt(x*x + y*y + z*z);
}, { description: 'Vector magnitude' });

functionCallSystem.defineFunction('vectorAdd', (args) => {
  const [v1, v2] = args;
  return [
    (v1[0] || 0) + (v2[0] || 0),
    (v1[1] || 0) + (v2[1] || 0),
    (v1[2] || 0) + (v2[2] || 0)
  ];
}, { description: 'Vector addition' });

functionCallSystem.defineFunction('vectorScale', (args) => {
  const [v, scalar] = args;
  return [
    v[0] * scalar,
    v[1] * scalar,
    v[2] * scalar
  ];
}, { description: 'Vector scaling' });

functionCallSystem.defineFunction('distance', (args) => {
  const [p1, p2] = args;
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  const dz = p1[2] - p2[2];
  return Math.sqrt(dx*dx + dy*dy + dz*dz);
}, { description: 'Distance between two points' });

functionCallSystem.defineFunction('lerp', (args) => {
  const [a, b, t] = args;
  return a + (b - a) * t;
}, { description: 'Linear interpolation' });

functionCallSystem.defineFunction('clamp', (args) => {
  const [value, min, max] = args;
  return Math.max(min, Math.min(max, value));
}, { description: 'Clamp value between min and max' });

functionCallSystem.defineFunction('sin', (args) => {
  return Math.sin(args[0]);
}, { description: 'Sine function' });

functionCallSystem.defineFunction('cos', (args) => {
  return Math.cos(args[0]);
}, { description: 'Cosine function' });

// Physics utility functions
functionCallSystem.defineFunction('gravityForce', (args, context, scene, system) => {
  const [mass1, mass2, distance, G = 6.674e-11] = args;
  if (distance === 0) return 0;
  return (G * mass1 * mass2) / (distance * distance);
}, { description: 'Calculate gravitational force between two masses' });

functionCallSystem.defineFunction('springForce', (args) => {
  const [k, displacement] = args;
  return -k * displacement;
}, { description: 'Calculate spring force given spring constant and displacement' });

// Random functions for procedural generation
functionCallSystem.defineFunction('random', (args) => {
  const [min = 0, max = 1] = args;
  return Math.random() * (max - min) + min;
}, { description: 'Random number between min and max' });

functionCallSystem.defineFunction('noise', (args) => {
  // Simple hash-based noise - replace with better implementation
  const [x, y = 0, z = 0] = args;
  const hash = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  return (hash - Math.floor(hash));
}, { description: 'Simple noise function' });

// Scene interaction functions
functionCallSystem.defineFunction('getObjectPosition', (args, context, scene) => {
  const [objectId] = args;
  const obj = scene?.objects?.find(o => o.id === objectId);
  return obj ? obj.position : [0, 0, 0];
}, { description: 'Get position of an object in the scene' });

functionCallSystem.defineFunction('getObjectVelocity', (args, context, scene) => {
  const [objectId] = args;
  const obj = scene?.objects?.find(o => o.id === objectId);
  return obj ? obj.velocity : [0, 0, 0];
}, { description: 'Get velocity of an object in the scene' });

// Built-in object generators for scene creation
functionCallSystem.defineObjectGenerator('generateSphereArray', (parameters, context, scene, system) => {
  const {
    count = 10,
    center = [0, 0, 0],
    radius = 0.5,
    spread = 1,
    mass = 1,
    color = "#ff6347",
    velocityVariation = 0
  } = parameters;

  const objects = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const r = Math.random() * spread;
    const x = center[0] + Math.cos(angle) * r;
    const y = center[1] + Math.sin(angle) * r;
    const z = center[2] + (Math.random() - 0.5) * spread;

    const velocity = velocityVariation > 0 ?
      [(Math.random() - 0.5) * velocityVariation, (Math.random() - 0.5) * velocityVariation, (Math.random() - 0.5) * velocityVariation] :
      [0, 0, 0];

    objects.push({
      id: `generated_sphere_${i}`,
      type: 'Sphere',
      mass: mass,
      radius: radius,
      position: [x, y, z],
      velocity: velocity,
      color: color,
      restitution: 0.8,
      friction: 0.3
    });
  }

  return objects;
}, { description: 'Generate an array of spheres in a circular pattern' });

functionCallSystem.defineObjectGenerator('generateCubeGrid', (parameters, context, scene, system) => {
  const {
    dimensions = [3, 3, 3], // [width, height, depth] in grid units
    spacing = 2,
    center = [0, 0, 0],
    size = 1,
    mass = 1,
    color = "#4169e1",
    randomizeColors = false
  } = parameters;

  const objects = [];
  const colors = ["#ff6347", "#4169e1", "#32cd32", "#ffd700", "#9932cc", "#ff4500", "#00ced1"];

  for (let x = 0; x < dimensions[0]; x++) {
    for (let y = 0; y < dimensions[1]; y++) {
      for (let z = 0; z < dimensions[2]; z++) {
        const posX = center[0] + (x - dimensions[0]/2 + 0.5) * spacing;
        const posY = center[1] + (y - dimensions[1]/2 + 0.5) * spacing;
        const posZ = center[2] + (z - dimensions[2]/2 + 0.5) * spacing;

        objects.push({
          id: `generated_cube_${x}_${y}_${z}`,
          type: 'Box',
          mass: mass,
          dimensions: [size, size, size],
          position: [posX, posY, posZ],
          velocity: [0, 0, 0],
          rotation: [0, 0, 0],
          color: randomizeColors ? colors[Math.floor(Math.random() * colors.length)] : color,
          restitution: 0.6,
          friction: 0.4
        });
      }
    }
  }

  return objects;
}, { description: 'Generate a 3D grid of cubes' });

functionCallSystem.defineObjectGenerator('generateHexagonalArrangement', (parameters, context, scene, system) => {
  const {
    rings = 3,
    center = [0, 5, 0],
    spacing = 3,
    radius = 0.5,
    height = 1,
    mass = 1,
    color = "#228b22",
    randomizeHeight = false
  } = parameters;

  const objects = [];

  // Generate hexagonal grid positions
  for (let q = -rings; q <= rings; q++) {
    const r1 = Math.max(-rings, -q - rings);
    const r2 = Math.min(rings, -q + rings);
    for (let r = r1; r <= r2; r++) {
      const x = (Math.sqrt(3) * q + Math.sqrt(3)/2 * r) * spacing;
      const z = (3/2 * r) * spacing;
      const y = center[1] + (randomizeHeight ? Math.random() * 2 : 0);

      objects.push({
        id: `generated_hex_${q}_${r}`,
        type: 'Cylinder',
        mass: mass,
        radius: radius,
        height: height,
        position: [center[0] + x, y, center[2] + z],
        velocity: [0, 0, 0],
        rotation: [Math.PI/2, 0, 0], // Lay flat
        color: color,
        restitution: 0.7,
        friction: 0.3
      });
    }
  }

  return objects;
}, { description: 'Generate objects in a hexagonal grid pattern' });

functionCallSystem.defineObjectGenerator('generateSpiral', (parameters, context, scene, system) => {
  const {
    count = 20,
    center = [0, 0, 0],
    radiusStart = 1,
    radiusEnd = 5,
    height = 10,
    turns = 3,
    size = 0.5,
    mass = 1,
    type = 'Sphere',
    color = "#ff6b6b"
  } = parameters;

  const objects = [];

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1); // 0 to 1
    const angle = t * turns * Math.PI * 2;
    const radius = radiusStart + t * (radiusEnd - radiusStart);
    const x = center[0] + Math.cos(angle) * radius;
    const z = center[2] + Math.sin(angle) * radius;
    const y = center[1] + t * height;

    objects.push({
      id: `generated_spiral_${i}`,
      type: type,
      mass: mass,
      radius: size,
      dimensions: type === 'Box' ? [size, size, size] : undefined,
      height: type === 'Cylinder' ? size * 2 : undefined,
      position: [x, y, z],
      velocity: [0, 0, 0],
      rotation: [0, 0, 0],
      color: color,
      restitution: 0.8,
      friction: 0.2
    });
  }

  return objects;
}, { description: 'Generate objects arranged in a spiral pattern' });

functionCallSystem.defineObjectGenerator('generateFractalTree', (parameters, context, scene, system) => {
  const {
    depth = 4,
    startPosition = [0, 0, 0],
    startDirection = [0, 1, 0], // Upward
    length = 2,
    branchAngle = Math.PI / 6, // 30 degrees
    lengthRatio = 0.7,
    radius = 0.3,
    mass = 2,
    color = "#8b4513"
  } = parameters;

  const objects = [];
  let segmentCount = 0;

  function addBranch(position, direction, length, depth, parentId = null) {
    if (depth <= 0 || length < 0.1) return;

    // Create cylinder segment
    const endPosition = [
      position[0] + direction[0] * length,
      position[1] + direction[1] * length,
      position[2] + direction[2] * length
    ];

    objects.push({
      id: `branch_${segmentCount++}`,
      type: 'Cylinder',
      mass: mass,
      radius: radius * Math.pow(lengthRatio, 4 - depth),
      height: length,
      position: [
        (position[0] + endPosition[0]) / 2,
        (position[1] + endPosition[1]) / 2,
        (position[2] + endPosition[2]) / 2
      ],
      rotation: [
        Math.atan2(Math.sqrt(direction[0]*direction[0] + direction[2]*direction[2]), direction[1]),
        Math.atan2(direction[2], direction[0]),
        0
      ],
      velocity: [0, 0, 0],
      color: color,
      restitution: 0.3,
      friction: 0.6
    });

    // Recursively add branches
    if (depth > 1) {
      // Left branch
      const leftDir = system.callFunction('rotateVector', [[[direction, [0, 0, branchAngle]]]]);
      addBranch(endPosition, leftDir, length * lengthRatio, depth - 1);

      // Right branch
      const rightDir = system.callFunction('rotateVector', [[[direction, [0, 0, -branchAngle]]]]);
      addBranch(endPosition, rightDir, length * lengthRatio, depth - 1);

      // Occasional third branch for complexity
      if (Math.random() < 0.3) {
        const upDir = system.callFunction('rotateVector', [[[direction, [0, branchAngle, 0]]]]);
        addBranch(endPosition, upDir, length * lengthRatio * 0.8, depth - 1);
      }
    }
  }

  // Add rotation utility if not exists
  if (!system.functions.rotateVector) {
    system.defineFunction('rotateVector', (args) => {
      const [vec, rotation] = args;
      // Simple rotation around Y axis
      const cos = Math.cos(rotation[1]);
      const sin = Math.sin(rotation[1]);
      return [
        vec[0] * cos - vec[2] * sin,
        vec[1],
        vec[0] * sin + vec[2] * cos
      ];
    });
  }

  addBranch(startPosition, startDirection, length, depth);
  return objects;
}, { description: 'Generate a fractal tree structure' });

functionCallSystem.defineObjectGenerator('generateTerrain', (parameters, context, scene, system) => {
  const {
    width = 10,
    depth = 10,
    resolution = 1,
    center = [0, 0, 0],
    height = 2,
    baseColor = "#8fbc8f",
    type = 'Box',
    mass = 0 // Static by default
  } = parameters;

  const objects = [];

  for (let x = 0; x < width; x += resolution) {
    for (let z = 0; z < depth; z += resolution) {
      // Simple noise-based height variation
      const noise = system.callFunction('noise', [[x * 0.1, z * 0.1]]);
      const posY = center[1] + noise * height;

      objects.push({
        id: `terrain_${x}_${z}`,
        type: type,
        mass: mass,
        isStatic: mass === 0,
        dimensions: type === 'Box' ? [resolution, resolution, resolution] : undefined,
        radius: type === 'Sphere' || type === 'Cylinder' ? resolution/2 : undefined,
        height: type === 'Cylinder' ? resolution : undefined,
        position: [center[0] + x - width/2, posY, center[2] + z - depth/2],
        velocity: [0, 0, 0],
        rotation: [0, 0, 0],
        color: baseColor,
        restitution: 0.4,
        friction: 0.8
      });
    }
  }

  return objects;
}, { description: 'Generate procedural terrain blocks' });

functionCallSystem.defineObjectGenerator('generateParticleField', (parameters, context, scene, system) => {
  const {
    count = 50,
    center = [0, 0, 0],
    bounds = [10, 10, 10], // [width, height, depth]
    mass = 0.1,
    radius = 0.1,
    colors = ["#ffffff", "#ff9999", "#99ff99", "#9999ff", "#ffff99"],
    randomizeVelocity = true,
    velocityRange = [-2, 2]
  } = parameters;

  const objects = [];

  for (let i = 0; i < count; i++) {
    const posX = center[0] + (Math.random() - 0.5) * bounds[0];
    const posY = center[1] + (Math.random() - 0.5) * bounds[1];
    const posZ = center[2] + (Math.random() - 0.5) * bounds[2];

    const velocity = randomizeVelocity ? [
      system.callFunction('random', [[velocityRange[0], velocityRange[1]]]),
      system.callFunction('random', [[velocityRange[0], velocityRange[1]]]),
      system.callFunction('random', [[velocityRange[0], velocityRange[1]]])
    ] : [0, 0, 0];

    objects.push({
      id: `particle_${i}`,
      type: 'Sphere',
      mass: mass,
      radius: radius,
      position: [posX, posY, posZ],
      velocity: velocity,
      rotation: [0, 0, 0],
      color: colors[Math.floor(Math.random() * colors.length)],
      restitution: 0.9,
      friction: 0.1
    });
  }

  return objects;
}, { description: 'Generate a field of particle-like small spheres' });

export default FunctionCallSystem;
