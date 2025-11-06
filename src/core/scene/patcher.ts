interface ValidationRule {
  [key: string]: (value: any) => boolean;
}

interface Patch {
  op: 'add' | 'replace' | 'remove';
  path: string;
  value?: any;
}

interface PatchResult {
  success: boolean;
  scene: Scene;
  error?: string;
}

type Scene = any;

// Scene Patcher Utility for JSON Patch Operations
class ScenePatcher {
  validationRules: ValidationRule;

  constructor() {
    this.validationRules = {
      // Scene property validations
      gravity: (value) => Array.isArray(value) && value.length === 3 && value.every(v => typeof v === 'number'),
      hasGround: (value) => typeof value === 'boolean',
      contactMaterial: (value) => typeof value === 'object' && value !== null &&
        (value.friction === undefined || (typeof value.friction === 'number' && value.friction >= 0 && value.friction <= 1)) &&
        (value.restitution === undefined || (typeof value.restitution === 'number' && value.restitution >= 0 && value.restitution <= 1)),
      gravitationalPhysics: (value) => typeof value === 'object' && value !== null &&
        typeof value.enabled === 'boolean',
      constraints: (value) => (typeof value === 'object' && value !== null &&
        typeof value.enabled === 'boolean') || Array.isArray(value),
      fluid: (value) => typeof value === 'object' && value !== null &&
        typeof value.enabled === 'boolean',
      joints: (value) => Array.isArray(value),

      // Object property validations
      position: (value) => Array.isArray(value) && value.length === 3 && value.every(v => typeof v === 'number'),
      velocity: (value) => Array.isArray(value) && value.length === 3 && value.every(v => typeof v === 'number'),
      rotation: (value) => Array.isArray(value) && value.length === 3 && value.every(v => typeof v === 'number'),
      angularVelocity: (value) => Array.isArray(value) && value.length === 3 && value.every(v => typeof v === 'number'),
      mass: (value) => typeof value === 'number' && value > 0,
      radius: (value) => typeof value === 'number' && value > 0,
      height: (value) => typeof value === 'number' && value > 0,
      color: (value) => typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value),
      opacity: (value) => typeof value === 'number' && value >= 0 && value <= 1,
      restitution: (value) => typeof value === 'number' && value >= 0 && value <= 1,
      friction: (value) => typeof value === 'number' && value >= 0 && value <= 1,
      dimensions: (value) => value === null || (Array.isArray(value) && value.length === 3 && value.every(v => typeof v === 'number')),
      type: (value) => ['Sphere', 'Box', 'Cylinder', 'Cone', 'Capsule', 'ConvexPolyhedron'].includes(value),
      id: (value) => typeof value === 'string' && value.length > 0,
      isStatic: (value) => typeof value === 'boolean',
      gravitationalMass: (value) => typeof value === 'number' && value > 0,

      // Joint property validations
      bodyA: (value) => typeof value === 'string' && value.length > 0,
      bodyB: (value) => typeof value === 'string' && value.length > 0,
      anchorA: (value) => Array.isArray(value) && value.length === 3 && value.every(v => typeof v === 'number'),
      anchorB: (value) => Array.isArray(value) && value.length === 3 && value.every(v => typeof v === 'number'),
      axis: (value) => Array.isArray(value) && value.length === 3 && value.every(v => typeof v === 'number'),
      distance: (value) => typeof value === 'number' && value > 0,

      // Visual annotation property validations
      fontSize: (value) => typeof value === 'number' && value > 0 && value < 200,
      fontFamily: (value) => typeof value === 'string',
      backgroundColor: (value) => typeof value === 'string', // Accept rgba() strings
      padding: (value) => typeof value === 'number' && value >= 0,
      borderRadius: (value) => typeof value === 'number' && value >= 0,
      attachedToObjectId: (value) => typeof value === 'string' && value.length > 0,
      contentType: (value) => ['speed', 'velocity', 'position', 'mass', 'kineticEnergy', 'momentum', 'custom'].includes(value),
      vectorType: (value) => ['velocity', 'momentum', 'acceleration', 'force', 'custom'].includes(value),
      anchor: (value) => ['top', 'bottom', 'left', 'right', 'center', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(value),
      offset: (value) => Array.isArray(value) && value.length === 3 && value.every(v => typeof v === 'number'),
      scale: (value) => typeof value === 'number' && value > 0,
      showMagnitude: (value) => typeof value === 'boolean',
      visible: (value) => typeof value === 'boolean',
      minSpeed: (value) => typeof value === 'number' && value >= 0,
      updateFrequency: (value) => typeof value === 'number' && value > 0 && value <= 240,
      precision: (value) => typeof value === 'number' && value >= 0 && value <= 10,
      prefix: (value) => typeof value === 'string',
      suffix: (value) => typeof value === 'string',
      customText: (value) => typeof value === 'string',
      shaftRadius: (value) => typeof value === 'number' && value > 0,
      headLength: (value) => typeof value === 'number' && value > 0,
      headRadius: (value) => typeof value === 'number' && value > 0,
      smoothness: (value) => typeof value === 'number' && value >= 0 && value <= 1,
    };
  }

  // Validate a single patch operation
  validatePatch(patch: Patch) {
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
  validatePatches(patches: Patch[]) {
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
  applyPatches(scene: Scene, patches: Patch[]) {
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
          const errorMsg = `Failed to apply patch ${i + 1}: ${result.error || 'Unknown error'}`;
          console.error(`❌ ${errorMsg}`);
          errors.push(errorMsg);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const errorMsg = `Exception applying patch ${i + 1}: ${message}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    // After applying patches, check if scene should be marked as extraterrestrial
    if (updatedScene && appliedCount > 0) {
      this.updateSceneType(updatedScene);
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
  // Fix invalid color formats (e.g., 5-digit hex colors)
  fixColor(color: any): string {
    if (typeof color !== 'string') return color;
    
    // Check if it's a hex color
    if (color.startsWith('#')) {
      // Remove # and check length
      const hex = color.substring(1);
      
      // If it's 5 digits (invalid), pad with 0 to make it 6
      if (hex.length === 5) {
        const fixed = '#' + hex + '0';
        console.warn(`⚠️ Fixed invalid color ${color} → ${fixed}`);
        return fixed;
      }
      
      // If it's not 3 or 6 digits, try to fix it
      if (hex.length !== 3 && hex.length !== 6) {
        // Pad or truncate to 6 digits
        const fixed = '#' + hex.padEnd(6, '0').substring(0, 6);
        console.warn(`⚠️ Fixed invalid color ${color} → ${fixed}`);
        return fixed;
      }
    }
    
    return color;
  }

  // Sanitize object data before adding to scene
  sanitizeObject(obj: any): any {
    const sanitized = { ...obj };
    
    // Fix color if present
    if (sanitized.color) {
      sanitized.color = this.fixColor(sanitized.color);
    }
    
    return sanitized;
  }

  applySinglePatch(scene: Scene, patch: Patch): PatchResult {
    const { op, path, value } = patch;

    try {
      if (op === 'add') {
        if (path === '/objects/-') {
          // Add new object to objects array
          if (!scene.objects) scene.objects = [];
          // Sanitize the object before adding
          const sanitizedValue = this.sanitizeObject(value);
          scene.objects.push(sanitizedValue);
          return { success: true, scene };
        } else {
          // General add: create path and set value
          const result = this.setValueByPath(scene, path, value);
          return result;
        }
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
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, scene, error: message };
    }
  }

  // Set value by JSON path (supports add/replace)
  setValueByPath(obj: Scene, path: string, value: any): PatchResult {
    const pathParts = path.substring(1).split('/').filter(p => p);
    let current = obj;

    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      const nextPart = pathParts[i + 1];

      // Handle array indexing (e.g., objects/0, objects[0])
      if (part === 'objects' && i + 1 < pathParts.length && !isNaN(pathParts[i + 1])) {
        // Standard JSON path format: /objects/0/property
        const index = parseInt(pathParts[i + 1]);
        if (!current[part]) current[part] = [];
        if (current[part].length <= index) {
          // Extend array if index is beyond current length
          while (current[part].length <= index) {
            current[part].push({});
          }
        }
        current = current[part][index];
        i++; // Skip the index part
      } else if (part.includes('[') && part.includes(']')) {
        // Handle bracket notation: /objects[0]/property
        const bracketIndex = part.indexOf('[');
        const arrayName = part.substring(0, bracketIndex);
        const indexStr = part.substring(bracketIndex + 1, part.length - 1);
        const index = parseInt(indexStr);

        if (isNaN(index)) {
          return { success: false, scene: obj, error: `Invalid array index: ${indexStr}` };
        }

        if (!current[arrayName]) current[arrayName] = [];
        if (current[arrayName].length <= index) {
          while (current[arrayName].length <= index) {
            current[arrayName].push({});
          }
        }
        current = current[arrayName][index];
      } else {
        // If next part is '-', this should be an array
        if (nextPart === '-') {
          if (!current[part]) current[part] = [];
          current = current[part];
        } else {
          // Regular object property
          if (!current[part]) current[part] = {};
          current = current[part];
        }
      }
    }

    const lastPart = pathParts[pathParts.length - 1];

    if (lastPart === '-') {
      // Append to array
      if (Array.isArray(current)) {
        current.push(value);
      } else {
        return { success: false, scene: obj, error: 'Can only append to arrays with -' };
      }
    } else if (lastPart.includes('[') && lastPart.includes(']')) {
      // Handle array indexing in the last part
      const bracketIndex = lastPart.indexOf('[');
      const arrayName = lastPart.substring(0, bracketIndex);
      const indexStr = lastPart.substring(bracketIndex + 1, lastPart.length - 1);
      const index = parseInt(indexStr);

      if (isNaN(index)) {
        return { success: false, scene: obj, error: `Invalid array index: ${indexStr}` };
      }

      if (!current[arrayName]) current[arrayName] = [];
      if (current[arrayName].length <= index) {
        while (current[arrayName].length <= index) {
          current[arrayName].push(null);
        }
      }
      current[arrayName][index] = value;
    } else {
      // Regular property assignment
      current[lastPart] = value;
    }

    return { success: true, scene: obj };
  }

  // Remove value by JSON path
  removeValueByPath(obj: Scene, path: string): PatchResult {
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

    const numLastPart = parseInt(lastPart);
    if (Array.isArray(current) && !isNaN(numLastPart)) {
      current.splice(numLastPart, 1);
    } else {
      delete current[lastPart];
    }

    return { success: true, scene: obj };
  }

  // Helper to get value by path (for validation)
  getValueByPath(obj: any, path: string): any {
    const pathParts = path.substring(1).split('/').filter(p => p);
    let current = obj;

    for (const part of pathParts) {
      if (Array.isArray(current) && !isNaN(part)) {
        const index = parseInt(part);
        if (!isNaN(index)) {
          current = current[index];
        } else {
          current = undefined;
        }
      } else {
        current = current[part];
      }
      if (current === undefined) return undefined;
    }

    return current;
  }

  // Create a diff between two scenes
  createDiff(oldScene: any, newScene: any): Patch[] {
    // This is a simplified diff - in production you'd use a proper diff library
    const patches: Patch[] = [];

    // Compare top-level properties
    const compareObjects = (oldObj: any, newObj: any, currentPath = '') => {
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

  // Update scene type based on extraterrestrial criteria
  updateSceneType(scene) {
    if (!scene) return;

    // Check if scene meets extraterrestrial criteria:
    // - gravity is [0, 0, 0] (zero gravity)
    // - hasGround is false
    // - gravitationalPhysics is enabled
    const isExtraterrestrial =
      scene.gravity &&
      Array.isArray(scene.gravity) &&
      scene.gravity.length === 3 &&
      scene.gravity[0] === 0 &&
      scene.gravity[1] === 0 &&
      scene.gravity[2] === 0 &&
      scene.hasGround === false &&
      scene.gravitationalPhysics &&
      scene.gravitationalPhysics.enabled === true;

    if (isExtraterrestrial) {
      scene.type = 'extraterrestrial';
      console.log('🌌 Scene marked as extraterrestrial - space background will be used');
    } else if (scene.type === 'extraterrestrial') {
      // Remove extraterrestrial type if it no longer meets criteria
      delete scene.type;
      console.log('🌍 Scene no longer meets extraterrestrial criteria - type removed');
    }
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
