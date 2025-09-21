// Scene Patcher Utility for JSON Patch Operations
class ScenePatcher {
  constructor() {
    this.validationRules = {
      // Scene property validations
      gravity: (value) => Array.isArray(value) && value.length === 3 && value.every(v => typeof v === 'number'),
      hasGround: (value) => typeof value === 'boolean',
      contactMaterial: (value) => typeof value === 'object' && value !== null,

      // Object property validations
      position: (value) => Array.isArray(value) && value.length === 3 && value.every(v => typeof v === 'number'),
      velocity: (value) => Array.isArray(value) && value.length === 3 && value.every(v => typeof v === 'number'),
      mass: (value) => typeof value === 'number' && value > 0,
      radius: (value) => typeof value === 'number' && value > 0,
      color: (value) => typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value),
      dimensions: (value) => Array.isArray(value) && value.length === 3 && value.every(v => typeof v === 'number'),
      type: (value) => ['Sphere', 'Box', 'Cylinder', 'Plane'].includes(value),
      id: (value) => typeof value === 'string' && value.length > 0
    };
  }

  // Validate a single patch operation
  validatePatch(patch) {
    console.log('🔍 Validating patch:', patch);

    if (!patch || typeof patch !== 'object') {
      return { valid: false, error: 'Patch must be an object' };
    }

    if (!patch.op || !['add', 'replace', 'remove'].includes(patch.op)) {
      return { valid: false, error: 'Invalid operation type' };
    }

    if (!patch.path || typeof patch.path !== 'string') {
      return { valid: false, error: 'Invalid path' };
    }

    // Validate path format
    if (!patch.path.startsWith('/')) {
      return { valid: false, error: 'Path must start with /' };
    }

    // For add and replace operations, validate the value
    if (patch.op !== 'remove') {
      if (patch.value === undefined) {
        return { valid: false, error: 'Value is required for add/replace operations' };
      }

      // Validate value based on path
      const pathParts = patch.path.split('/').filter(p => p);
      const lastPart = pathParts[pathParts.length - 1];

      if (this.validationRules[lastPart]) {
        const isValid = this.validationRules[lastPart](patch.value);
        if (!isValid) {
          return { valid: false, error: `Invalid value for ${lastPart}` };
        }
      }
    }

    return { valid: true };
  }

  // Validate an array of patches
  validatePatches(patches) {
    if (!Array.isArray(patches)) {
      return { valid: false, error: 'Patches must be an array' };
    }

    for (let i = 0; i < patches.length; i++) {
      const validation = this.validatePatch(patches[i]);
      if (!validation.valid) {
        return {
          valid: false,
          error: `Patch ${i}: ${validation.error}`,
          patchIndex: i
        };
      }
    }

    return { valid: true };
  }

  // Apply patches with validation and error recovery
  applyPatches(scene, patches) {
    console.log('🔧 ScenePatcher: Applying patches...');

    // Handle empty or invalid inputs
    if (!scene) {
      return {
        success: false,
        scene: null,
        error: 'No scene provided',
        appliedPatches: 0
      };
    }

    if (!patches || !Array.isArray(patches)) {
      console.log('ℹ️ No patches to apply');
      return {
        success: true,
        scene: scene,
        appliedPatches: 0,
        totalPatches: 0
      };
    }

    // Validate all patches first
    const validation = this.validatePatches(patches);
    if (!validation.valid) {
      console.error('❌ Patch validation failed:', validation.error);
      return {
        success: false,
        scene: scene,
        error: validation.error,
        appliedPatches: 0
      };
    }

    let updatedScene = JSON.parse(JSON.stringify(scene)); // Deep clone
    let appliedCount = 0;
    const errors = [];

    for (let i = 0; i < patches.length; i++) {
      const patch = patches[i];

      try {
        const result = this.applySinglePatch(updatedScene, patch);
        if (result.success) {
          updatedScene = result.scene;
          appliedCount++;
          console.log(`✅ Applied patch ${i + 1}: ${patch.op} ${patch.path}`);
        } else {
          const errorMsg = `Failed to apply patch ${i + 1}: ${result.error}`;
          console.error(`❌ ${errorMsg}`);
          errors.push(errorMsg);
        }
      } catch (error) {
        const errorMsg = `Exception applying patch ${i + 1}: ${error.message}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    const success = appliedCount > 0;
    const errorMessage = errors.length > 0 ? errors.join('; ') : null;

    return {
      success: success,
      scene: updatedScene,
      appliedPatches: appliedCount,
      totalPatches: patches.length,
      error: errorMessage
    };
  }

  // Apply a single patch operation
  applySinglePatch(scene, patch) {
    const { op, path, value } = patch;

    try {
      if (op === 'add' && path === '/objects/-') {
        // Add new object to objects array
        if (!scene.objects) scene.objects = [];
        scene.objects.push(value);
        return { success: true, scene };
      }

      if (op === 'replace') {
        // Replace property value using path navigation
        const result = this.setValueByPath(scene, path, value);
        return result;
      }

      if (op === 'remove') {
        // Remove property or array item
        const result = this.removeValueByPath(scene, path);
        return result;
      }

      return { success: false, scene, error: `Unsupported operation: ${op}` };
    } catch (error) {
      return { success: false, scene, error: error.message };
    }
  }

  // Set value by JSON path
  setValueByPath(obj, path, value) {
    const pathParts = path.substring(1).split('/').filter(p => p);
    let current = obj;

    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];

      if (part === 'objects' && !isNaN(pathParts[i + 1])) {
        // Handle array indexing for objects
        const index = parseInt(pathParts[i + 1]);
        if (!current[part]) current[part] = [];
        if (!current[part][index]) current[part][index] = {};
        current = current[part][index];
        i++; // Skip next part
      } else {
        if (!current[part]) current[part] = {};
        current = current[part];
      }
    }

    const lastPart = pathParts[pathParts.length - 1];
    current[lastPart] = value;

    return { success: true, scene: obj };
  }

  // Remove value by JSON path
  removeValueByPath(obj, path) {
    const pathParts = path.substring(1).split('/').filter(p => p);
    let current = obj;

    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!current[part]) {
        return { success: false, scene: obj, error: `Path not found: ${path}` };
      }
      current = current[part];
    }

    const lastPart = pathParts[pathParts.length - 1];

    if (Array.isArray(current) && !isNaN(lastPart)) {
      current.splice(parseInt(lastPart), 1);
    } else {
      delete current[lastPart];
    }

    return { success: true, scene: obj };
  }

  // Create a diff between two scenes
  createDiff(oldScene, newScene) {
    // This is a simplified diff - in production you'd use a proper diff library
    const patches = [];

    // Compare top-level properties
    const compareObjects = (oldObj, newObj, currentPath = '') => {
      for (const key in newObj) {
        const fullPath = currentPath + '/' + key;

        if (!(key in oldObj)) {
          // New property
          if (Array.isArray(newObj[key])) {
            // Handle arrays specially
            newObj[key].forEach((item, index) => {
              patches.push({
                op: 'add',
                path: fullPath + '/' + index,
                value: item
              });
            });
          } else {
            patches.push({
              op: 'add',
              path: fullPath,
              value: newObj[key]
            });
          }
        } else if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
          // Modified property
          patches.push({
            op: 'replace',
            path: fullPath,
            value: newObj[key]
          });
        }
      }

      // Check for removed properties
      for (const key in oldObj) {
        if (!(key in newObj)) {
          patches.push({
            op: 'remove',
            path: currentPath + '/' + key
          });
        }
      }
    };

    compareObjects(oldScene, newScene);
    return patches;
  }

  // Get scene statistics
  getSceneStats(scene) {
    const stats = {
      totalObjects: scene.objects ? scene.objects.length : 0,
      objectTypes: {},
      totalMass: 0,
      hasGround: scene.hasGround || false,
      gravity: scene.gravity || [0, -9.81, 0]
    };

    if (scene.objects) {
      scene.objects.forEach(obj => {
        if (obj.type) {
          stats.objectTypes[obj.type] = (stats.objectTypes[obj.type] || 0) + 1;
        }
        if (obj.mass) {
          stats.totalMass += obj.mass;
        }
      });
    }

    return stats;
  }
}

export default ScenePatcher;
