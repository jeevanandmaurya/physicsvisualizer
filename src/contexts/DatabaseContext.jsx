import React, { createContext, useContext, useCallback } from 'react';
// NOTE: Path updated from scenes.js to data.js as per refactor plan
import { mechanicsExamples } from '../scenes.js';
import ScenePatcher from '../core/scene/patcher';

const DatabaseContext = createContext();

export function useDatabase() {
  return useContext(DatabaseContext);
}

// AI Property Manager for precise property access
class AIPropertyManager {
  constructor() {
    this.properties = new Map();
    this.propertyPatterns = {
      // Pattern-based property inference for AI
      "*\\.position": { type: "vector3", unit: "meters", dynamic: true },
      "*\\.velocity": { type: "vector3", unit: "m/s", dynamic: true },
      "*\\.rotation": { type: "vector3", unit: "radians", dynamic: true },
      "*\\.mass": { type: "number", unit: "kg", constraints: { min: 0.1 } },
      "*\\.radius": { type: "number", unit: "meters", constraints: { min: 0 } },
      "*\\.height": { type: "number", unit: "meters", constraints: { min: 0 } },
      "*\\.friction": { type: "number", unit: "coefficient", constraints: { min: 0, max: 1 } },
      "*\\.restitution": { type: "number", unit: "coefficient", constraints: { min: 0, max: 1 } },
      "scene\\.gravity": { type: "vector3", unit: "m/s²" },
      "scene\\.hasGround": { type: "boolean" },
      "scene\\.contactMaterial\\.friction": { type: "number", unit: "coefficient", constraints: { min: 0, max: 1 } },
      "scene\\.contactMaterial\\.restitution": { type: "number", unit: "coefficient", constraints: { min: 0, max: 1 } }
    };
    this.changeHistory = [];
  }

  // Initialize properties from scene data
  initializeFromScene(scene) {
    this.properties.clear();

    // Scene-level properties
    this.setPropertyData("scene.gravity", scene.gravity, "Scene gravity vector");
    this.setPropertyData("scene.hasGround", scene.hasGround, "Whether scene has ground plane");
    this.setPropertyData("scene.contactMaterial.friction", scene.contactMaterial?.friction || 0.5, "Default friction");
    this.setPropertyData("scene.contactMaterial.restitution", scene.contactMaterial?.restitution || 0.7, "Default restitution");

    // Object properties
    scene.objects?.forEach(obj => {
      const prefix = `object.${obj.id}`;
      this.setPropertyData(`${prefix}.type`, obj.type, "Object type");
      this.setPropertyData(`${prefix}.mass`, obj.mass, "Object mass");
      this.setPropertyData(`${prefix}.position`, obj.position, "Object position");
      this.setPropertyData(`${prefix}.velocity`, obj.velocity || [0, 0, 0], "Object velocity");

      if (obj.dimensions) {
        this.setPropertyData(`${prefix}.dimensions`, obj.dimensions, "Object dimensions");
      }
      if (obj.radius) {
        this.setPropertyData(`${prefix}.radius`, obj.radius, "Object radius");
      }
      if (obj.height) {
        this.setPropertyData(`${prefix}.height`, obj.height, "Object height");
      }
      if (obj.color) {
        this.setPropertyData(`${prefix}.color`, obj.color, "Object color");
      }
      if (obj.isStatic !== undefined) {
        this.setPropertyData(`${prefix}.isStatic`, obj.isStatic, "Object static state");
      }
    });
  }

  // Clear all object properties (for fresh scene creation)
  clearObjectProperties() {
    console.log('🧹 Clearing all object properties...');
    const propertiesToDelete = [];

    for (const [path] of this.properties) {
      if (path.startsWith("object.")) {
        propertiesToDelete.push(path);
      }
    }

    propertiesToDelete.forEach(path => {
      this.properties.delete(path);
      console.log(`🗑️ Deleted property: ${path}`);
    });

    console.log(`✅ Cleared ${propertiesToDelete.length} object properties`);
  }

  // Set property data with metadata
  setPropertyData(propertyPath, value, description = "") {
    const patternMatch = this.getPatternMatch(propertyPath);
    const metadata = patternMatch || { type: "unknown" };

    this.properties.set(propertyPath, {
      value,
      type: metadata.type,
      unit: metadata.unit,
      constraints: metadata.constraints,
      description,
      lastModified: new Date().toISOString(),
      modifiedBy: "system"
    });
  }

  // Get property with pattern inference
  getProperty(propertyPath) {
    if (this.properties.has(propertyPath)) {
      return this.properties.get(propertyPath);
    }

    // Try pattern matching
    const patternMatch = this.getPatternMatch(propertyPath);
    if (patternMatch) {
      return {
        value: null, // Not set yet
        type: patternMatch.type,
        unit: patternMatch.unit,
        constraints: patternMatch.constraints,
        inferred: true
      };
    }

    return null;
  }

  // Set property value (AI interface)
  async setProperty(propertyPath, value, reason = "") {
    let property = this.getProperty(propertyPath);

    // If property doesn't exist, create it dynamically
    if (!property) {
      console.log(`Creating new property: ${propertyPath}`);
      const patternMatch = this.getPatternMatch(propertyPath);
      const metadata = patternMatch || { type: "unknown" };

      property = {
        value: null, // Will be set below
        type: metadata.type,
        unit: metadata.unit,
        constraints: metadata.constraints,
        description: `Dynamically created by AI`,
        lastModified: new Date().toISOString(),
        modifiedBy: "ai_agent",
        inferred: true
      };
    }

    // Validate constraints
    if (property.constraints) {
      if (!this.validateValue(value, property.constraints)) {
        console.warn(`Value ${value} violates constraints for ${propertyPath}, but proceeding anyway`);
        // Don't throw error, just warn and continue
      }
    }

    // Record change
    if (property.value !== null && property.value !== undefined) {
      this.changeHistory.push({
        timestamp: new Date().toISOString(),
        property: propertyPath,
        oldValue: property.value,
        newValue: value,
        reason,
        confidence: 0.95
      });
    }

    // Update property
    property.value = value;
    property.lastModified = new Date().toISOString();
    property.modifiedBy = "ai_agent";

    this.properties.set(propertyPath, property);

    console.log(`Property ${propertyPath} set to:`, value);
    return property;
  }

  // Find properties matching pattern
  findProperties(pattern, condition = null) {
    const matches = [];

    for (const [path, property] of this.properties) {
      if (this.matchesPattern(path, pattern)) {
        if (!condition || this.evaluateCondition(property.value, condition)) {
          matches.push({ path, property });
        }
      }
    }

    return matches;
  }

  // Get scene data from properties
  getSceneData(sceneId) {
    console.log('🔄 Reconstructing scene data from properties...');
    console.log('📊 Total properties in database:', this.properties.size);

    // Log all object-related properties
    const objectProperties = Array.from(this.properties.entries()).filter(([path]) => path.startsWith('object.'));
    console.log('📦 Object properties found:', objectProperties.length);
    objectProperties.forEach(([path, prop]) => {
      console.log(`  ${path}: ${JSON.stringify(prop.value)}`);
    });

    const scene = {
      id: sceneId,
      objects: [],
      gravity: [0, -9.81, 0],
      hasGround: true,
      contactMaterial: { friction: 0.5, restitution: 0.7 },
      gravitationalPhysics: { enabled: false },
      simulationScale: "terrestrial"
    };

    // Extract scene properties - try multiple variations
    const gravity = this.properties.get("scene.gravity") || this.properties.get("scene.Gravity");
    if (gravity) {
      scene.gravity = gravity.value;
      console.log('✅ Set gravity:', gravity.value);
    }

    const hasGround = this.properties.get("scene.hasGround") || this.properties.get("scene.hasground") || this.properties.get("scene.HasGround");
    if (hasGround) {
      scene.hasGround = hasGround.value;
      console.log('✅ Set hasGround:', hasGround.value);
    }

    const friction = this.properties.get("scene.contactMaterial.friction");
    if (friction) {
      scene.contactMaterial.friction = friction.value;
      console.log('✅ Set friction:', friction.value);
    }

    const restitution = this.properties.get("scene.contactMaterial.restitution");
    if (restitution) {
      scene.contactMaterial.restitution = restitution.value;
      console.log('✅ Set restitution:', restitution.value);
    }

    // Extract objects
    const objectPaths = new Set();
    for (const path of this.properties.keys()) {
      if (path.startsWith("object.")) {
        const parts = path.split(".");
        if (parts.length >= 2) {
          objectPaths.add(parts[1]); // object ID
        }
      }
    }

    console.log('🏗️ Reconstructing objects for IDs:', Array.from(objectPaths));

    for (const objId of objectPaths) {
      const obj = { id: objId };
      console.log(`🏗️ Reconstructing object: ${objId}`);

      // Get all properties for this object
      let propertiesFound = 0;
      for (const [path, property] of this.properties) {
        if (path.startsWith(`object.${objId}.`)) {
          const propName = path.split(".").slice(2).join(".");
          obj[propName] = property.value;
          propertiesFound++;
          console.log(`  📝 Set ${propName}:`, property.value);
        }
      }

      if (propertiesFound > 0) {
        scene.objects.push(obj);
        console.log(`✅ Added object ${objId} with ${propertiesFound} properties:`, obj);
      } else {
        console.log(`⚠️ Object ${objId} has no properties, skipping`);
      }
    }

    console.log('🎯 Final reconstructed scene with', scene.objects.length, 'objects:', scene);
    return scene;
  }

  // Helper methods
  getPatternMatch(propertyPath) {
    for (const [pattern, metadata] of Object.entries(this.propertyPatterns)) {
      if (this.matchesPattern(propertyPath, pattern)) {
        return metadata;
      }
    }
    return null;
  }

  matchesPattern(path, pattern) {
    const regex = new RegExp(pattern.replace(/\*/g, ".*"));
    return regex.test(path);
  }

  validateValue(value, constraints) {
    if (Array.isArray(value)) {
      return value.every(v => this.validateSingleValue(v, constraints));
    }
    return this.validateSingleValue(value, constraints);
  }

  validateSingleValue(value, constraints) {
    if (constraints.min !== undefined && value < constraints.min) return false;
    if (constraints.max !== undefined && value > constraints.max) return false;
    return true;
  }

  evaluateCondition(value, condition) {
    // Simple condition evaluation (can be extended)
    if (typeof condition === "string") {
      // e.g., "> 1", "< 5", "== true"
      const match = condition.match(/^([><=]+)\s*(.+)$/);
      if (match) {
        const [, operator, target] = match;
        const targetValue = isNaN(target) ? target : parseFloat(target);

        switch (operator) {
          case ">": return value > targetValue;
          case "<": return value < targetValue;
          case ">=": return value >= targetValue;
          case "<=": return value <= targetValue;
          case "==": return value == targetValue; // eslint-disable-line eqeqeq
          case "!=": return value != targetValue; // eslint-disable-line eqeqeq
        }
      }
    }
    return false;
  }
}

const LOCAL_STORAGE_KEY = 'physicsVisualizerScenes';
const CHAT_HISTORY_KEY = 'physicsVisualizerChatHistory';

// Helper function to get scenes from localStorage
const getLocalScenes = () => {
    try {
        const scenesJson = localStorage.getItem(LOCAL_STORAGE_KEY);
        return scenesJson ? JSON.parse(scenesJson) : [];
    } catch (error) {
        console.error("Error reading scenes from localStorage", error);
        return [];
    }
};

// Helper function to save scenes to localStorage
const saveLocalScenes = (scenes) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(scenes));
    } catch (error) {
        console.error("Error saving scenes to localStorage", error);
    }
};

// Helper function to get chat history from localStorage
const getChatHistoryFromStorage = () => {
    try {
        const chatHistoryJson = localStorage.getItem(CHAT_HISTORY_KEY);
        return chatHistoryJson ? JSON.parse(chatHistoryJson) : [];
    } catch (error) {
        console.error("Error reading chat history from localStorage", error);
        return [];
    }
};

// Helper function to save chat history to localStorage
const saveChatHistoryToStorage = (chatHistory) => {
    try {
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatHistory));
    } catch (error) {
        console.error("Error saving chat history to localStorage", error);
    }
};

// Helper function to create sample chat data for demonstration
const createSampleChatData = () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const fifteenMinAgo = new Date(now.getTime() - 15 * 60 * 1000);

    return [
        {
            id: "demo-chat-multi-scene",
            title: "Multi-Scene Physics Exploration",
            sceneId: "basic-shapes-showcase", // Initial scene
            scenes: [
                { id: "basic-shapes-showcase", name: "Basic Shapes Showcase", timestamp: oneHourAgo.toISOString() },
                { id: "simple-pendulum", name: "Simple Pendulum", timestamp: thirtyMinAgo.toISOString() },
                { id: "projectile-motion", name: "Projectile Motion", timestamp: fifteenMinAgo.toISOString() }
            ],
            createdAt: oneHourAgo.toISOString(),
            updatedAt: fifteenMinAgo.toISOString(),
            messages: [
                {
                    id: "msg-demo-001",
                    text: "Hello! I'm exploring different physics scenarios. Let me start with the basic shapes showcase to see how different objects interact under gravity.",
                    isUser: false,
                    timestamp: oneHourAgo,
                    sceneId: "basic-shapes-showcase"
                },
                {
                    id: "msg-demo-002",
                    text: "That looks interesting! I can see spheres, boxes, and cylinders falling under gravity. Let me check the scene context to understand the physics setup.",
                    isUser: true,
                    timestamp: new Date(oneHourAgo.getTime() + 2 * 60 * 1000),
                    sceneId: "basic-shapes-showcase"
                },
                {
                    id: "msg-demo-003",
                    text: "Now let me switch to a different scene to explore projectile motion - this will show parabolic trajectories and the effects of initial velocity and gravity.",
                    isUser: true,
                    timestamp: new Date(oneHourAgo.getTime() + 5 * 60 * 1000),
                    sceneId: "basic-shapes-showcase"
                },
                {
                    id: "msg-demo-004",
                    text: "Perfect! Now I'm looking at projectile motion. The scene shows a ball being launched at an angle with gravity affecting its trajectory. This demonstrates the independence of horizontal and vertical motion components.",
                    isUser: false,
                    timestamp: new Date(oneHourAgo.getTime() + 6 * 60 * 1000),
                    sceneId: "projectile-motion"
                },
                {
                    id: "msg-demo-005",
                    text: "Let me try the pendulum scene to see harmonic motion and conservation of energy in action.",
                    isUser: true,
                    timestamp: thirtyMinAgo,
                    sceneId: "projectile-motion"
                },
                {
                    id: "msg-demo-006",
                    text: "Excellent! The pendulum demonstrates simple harmonic motion with a pivot point, string, and bob. The motion shows how potential energy converts to kinetic energy and back again.",
                    isUser: false,
                    timestamp: new Date(thirtyMinAgo.getTime() + 2 * 60 * 1000),
                    sceneId: "simple-pendulum"
                },
                {
                    id: "msg-demo-007",
                    text: "Now let me explore conservation of momentum with the cart collision scene - this will show how momentum is conserved in elastic collisions.",
                    isUser: true,
                    timestamp: new Date(thirtyMinAgo.getTime() + 5 * 60 * 1000),
                    sceneId: "simple-pendulum"
                },
                {
                    id: "msg-demo-008",
                    text: "Great choice! This scene shows two carts on a track - one stationary and one moving. When they collide, you'll see momentum conservation in action, with the stationary cart gaining velocity while the moving cart slows down.",
                    isUser: false,
                    timestamp: new Date(thirtyMinAgo.getTime() + 6 * 60 * 1000),
                    sceneId: "conservation-momentum"
                },
                {
                    id: "msg-demo-009",
                    text: "Finally, let me check out the solar system simulation to see gravitational interactions between multiple bodies and orbital mechanics.",
                    isUser: true,
                    timestamp: fifteenMinAgo,
                    sceneId: "conservation-momentum"
                },
                {
                    id: "msg-demo-010",
                    text: "Wonderful! The solar system scene demonstrates N-body gravitational physics with planets orbiting around a central star. Each object has mass, position, and velocity that affect the orbital mechanics, showing how gravity creates stable orbital patterns.",
                    isUser: false,
                    timestamp: new Date(fifteenMinAgo.getTime() + 2 * 60 * 1000),
                    sceneId: "solar-system-basics"
                },
                {
                    id: "msg-demo-011",
                    text: "This multi-scene exploration shows how different physics principles work together. From basic gravity and collisions to complex orbital mechanics, each scene demonstrates fundamental physics concepts that build upon each other.",
                    isUser: false,
                    timestamp: new Date(fifteenMinAgo.getTime() + 3 * 60 * 1000),
                    sceneId: "solar-system-basics"
                }
            ]
        }
    ];
};


export function DatabaseProvider({ children }) {
  // AI Property Manager instance
  const propertyManager = React.useMemo(() => new AIPropertyManager(), []);

  // --- DATA MANAGER API ---

  /**
   * Fetches scenes from various sources based on type.
   */
  const getScenes = useCallback(async (type, options = {}) => {
    switch (type) {
      case 'user':
      case 'local': // Added alias for clarity
        let scenes = getLocalScenes();
        // Optional: Add sorting if needed, mimicking firestore's orderBy
        if (options.orderBy?.field === 'updatedAt') {
            scenes.sort((a, b) => {
                const dateA = new Date(a.updatedAt);
                const dateB = new Date(b.updatedAt);
                return options.orderBy.direction === 'desc' ? dateB - dateA : dateA - dateB;
            });
        }
        // Optional: Add limit if needed
        if (options.limitTo) {
            scenes = scenes.slice(0, options.limitTo);
        }
        return Promise.resolve(scenes);

      case 'examples':
        return Promise.resolve(mechanicsExamples);

      default:
        console.error(`Unknown scene type: ${type}`);
        return Promise.resolve([]);
    }
  }, []);

  /**
   * Fetches a single scene by its ID.
   */
  const getSceneById = useCallback(async (sceneId) => {
    // Check local scenes first
    const localScenes = getLocalScenes();
    const scene = localScenes.find(s => s.id === sceneId);
    if (scene) return scene;

    // Fallback to checking example scenes
    const exampleScene = mechanicsExamples.find(s => s.id === sceneId);
    return exampleScene || null;
  }, []);

  /**
   * Saves or updates a scene to the user's collection.
   */
  const saveScene = useCallback(async (sceneObject) => {
    const scenes = getLocalScenes();
    const now = new Date().toISOString();
    
    // Remove temporary client-side flags before saving
    const { isExtracted, isTemporary, ...dataToSave } = sceneObject;

    const sceneData = {
      ...dataToSave,
      updatedAt: now,
    };

    const existingIndex = scenes.findIndex(s => s.id === sceneObject.id);

    if (existingIndex !== -1) {
        // Update existing scene
        scenes[existingIndex] = { ...scenes[existingIndex], ...sceneData };
    } else {
        // Create new scene
        sceneData.id = sceneData.id && !sceneData.id.startsWith('new-') ? sceneData.id : `local-${Date.now()}`;
        sceneData.createdAt = now;
        scenes.push(sceneData);
    }

    // Debug: log thumbnail presence and approximate size
    try {
      if (sceneData.thumbnailUrl) {
        const approxKb = Math.round((sceneData.thumbnailUrl.length * 3 / 4) / 1024);
        console.log(`💾 Saving scene ${sceneData.id} with thumbnail (approx ${approxKb} KB)`);
      } else {
        console.log(`💾 Saving scene ${sceneData.id} without thumbnail`);
      }
    } catch (e) {
      console.log('💾 Saving scene (thumbnail check failed)', e);
    }

    saveLocalScenes(scenes);

    // Debug: confirm localStorage size
    try {
      const allScenesJson = localStorage.getItem(LOCAL_STORAGE_KEY) || '';
      console.log(`💾 localStorage ${LOCAL_STORAGE_KEY} length: ${allScenesJson.length}`);
    } catch (e) {
      console.warn('Could not read localStorage for debug:', e);
    }

    return sceneData.id;
  }, []);

  /**
   * Deletes a scene from the user's collection.
   */
  const deleteScene = useCallback(async (sceneId) => {
    if (!sceneId) throw new Error("Scene ID is required for deletion.");
    let scenes = getLocalScenes();
    scenes = scenes.filter(s => s.id !== sceneId);
    saveLocalScenes(scenes);
  }, []);

  /**
   * Logs that a user has viewed a scene by saving it to localStorage.
   * The list is capped at 10 items.
   * @param {string} sceneId - The ID of the viewed scene.
   * @param {string} sceneName - The name of the viewed scene.
   * @param {boolean} isPublic - Whether the scene is public (now means 'is an example').
   */
  const logSceneView = useCallback((sceneId, sceneName, isPublic) => {
    if (!sceneId || !sceneName) return;
    try {
      const recentScenes = JSON.parse(localStorage.getItem('recentScenes') || '[]');
      const filteredScenes = recentScenes.filter(s => s.id !== sceneId);
      const newRecent = [{ id: sceneId, name: sceneName, isPublic, viewedAt: new Date().toISOString() }, ...filteredScenes];
      const limitedRecent = newRecent.slice(0, 10);
      localStorage.setItem('recentScenes', JSON.stringify(limitedRecent));
    } catch (error) {
      console.error("Could not update recent scenes in localStorage:", error);
    }
  }, []);

  /**
   * Gets the list of recently viewed scenes from localStorage.
   * @returns {Array} An array of up to 10 recently viewed scene objects.
   */
  const getRecentScenes = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem('recentScenes') || '[]');
    } catch (error) {
      console.error("Could not retrieve recent scenes from localStorage:", error);
      return [];
    }
  }, []);

  /**
   * Gets all chat history
   */
  const getChatHistory = useCallback(async () => {
    let chats = getChatHistoryFromStorage();

    // Separate demo and user chats
    const demoChats = chats.filter(chat => chat.id.startsWith('demo-'));
    const userChats = chats.filter(chat => !chat.id.startsWith('demo-'));

    // Check if demo chat was explicitly deleted
    const demoChatDeleted = localStorage.getItem('demoChatDeleted') === 'true';

    // Include demo chat if it doesn't exist and wasn't explicitly deleted
    if (demoChats.length === 0 && !demoChatDeleted) {
      const sampleData = createSampleChatData();
      chats = [...sampleData, ...userChats];
      saveChatHistoryToStorage(chats);
    } else {
      // Keep existing demo chat and user chats
      chats = [...demoChats, ...userChats];
    }

    return Promise.resolve(chats);
  }, []);

  /**
   * Creates or gets an empty chat for an example scene
   */
  const getOrCreateExampleChat = useCallback(async (sceneId, sceneName) => {
    const chats = getChatHistoryFromStorage();
    const existingChat = chats.find(chat => chat.sceneId === sceneId && chat.id.startsWith('example-'));

    if (existingChat) {
      return existingChat;
    }

    // Create new empty chat for the example scene
    const newChat = {
      id: `example-${sceneId}`,
      title: `${sceneName} (Example)`,
      sceneId: sceneId,
      messages: [{
        id: `msg-${Date.now()}`,
        text: "Hello! I'm a Physics AI Agent. I can help you with physics questions and also discuss how to represent described scenes in a 3D visualizer JSON format. How can I assist you with physics today?",
        isUser: false,
        timestamp: new Date(),
        sceneId: sceneId
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isExample: true
    };

    chats.push(newChat);
    saveChatHistoryToStorage(chats);

    console.log('📝 Created empty chat for example scene:', sceneId);
    return newChat;
  }, []);

  /**
   * Saves a new chat or updates an existing one
   */
  const saveChat = useCallback(async (chatData) => {
    const chats = getChatHistoryFromStorage();
    const now = new Date().toISOString();

    const chatToSave = {
      ...chatData,
      updatedAt: now,
    };

    const existingIndex = chats.findIndex(c => c.id === chatData.id);

    if (existingIndex !== -1) {
      // Update existing chat
      chats[existingIndex] = { ...chats[existingIndex], ...chatToSave };
    } else {
      // Create new chat
      chatToSave.id = chatToSave.id || `chat-${Date.now()}`;
      chatToSave.createdAt = now;
      chats.push(chatToSave);
    }

    saveChatHistoryToStorage(chats);
    return chatToSave.id;
  }, []);

  /**
   * Deletes a chat from history
   */
  const deleteChat = useCallback(async (chatId) => {
    if (!chatId) throw new Error("Chat ID is required for deletion.");

    let chats = getChatHistoryFromStorage();
    chats = chats.filter(c => c.id !== chatId);

    // If demo chat was deleted, mark it as deleted so it doesn't get recreated
    if (chatId.startsWith('demo-')) {
      try {
        localStorage.setItem('demoChatDeleted', 'true');
      } catch (error) {
        console.error("Could not mark demo chat as deleted:", error);
      }
    }

    saveChatHistoryToStorage(chats);
  }, []);

  /**
   * Gets a specific chat by ID
   */
  const getChatById = useCallback(async (chatId) => {
    const chats = getChatHistoryFromStorage();
    return chats.find(c => c.id === chatId) || null;
  }, []);

  /**
   * Applies JSON patches to a scene and returns the updated scene
   */
  const applyScenePatches = useCallback(async (scene, patches) => {
    try {
      console.log('🔧 Applying scene patches...');
      console.log('📋 Patches to apply:', patches.length);

      // Create a deep copy of the scene
      const updatedScene = JSON.parse(JSON.stringify(scene));

      // Apply each patch
      patches.forEach(patch => {
        console.log(`🔄 Applying patch: ${patch.op} ${patch.path}`);

        const pathParts = patch.path.split('/').filter(p => p);
        let current = updatedScene;

        // Navigate to the parent of the target property
        for (let i = 0; i < pathParts.length - 1; i++) {
          const part = pathParts[i];
          if (part === 'objects' && !isNaN(pathParts[i + 1])) {
            // Handle array indices for objects
            const index = parseInt(pathParts[i + 1]);
            if (!current[part]) current[part] = [];
            if (!current[part][index]) current[part][index] = {};
            current = current[part][index];
            i++; // Skip the next part since we handled it
          } else {
            if (!current[part]) current[part] = {};
            current = current[part];
          }
        }

        // Apply the change
        const lastPart = pathParts[pathParts.length - 1];
        if (patch.op === 'replace') {
          current[lastPart] = patch.value;
        } else if (patch.op === 'add') {
          if (Array.isArray(current)) {
            if (lastPart === '-') {
              current.push(patch.value);
            } else {
              current.splice(parseInt(lastPart), 0, patch.value);
            }
          } else {
            current[lastPart] = patch.value;
          }
        } else if (patch.op === 'remove') {
          if (Array.isArray(current)) {
            current.splice(parseInt(lastPart), 1);
          } else {
            delete current[lastPart];
          }
        }
      });

      console.log('✅ Scene patches applied successfully');
      return updatedScene;
    } catch (error) {
      console.error('❌ Failed to apply scene patches:', error);
      throw error;
    }
  }, []);

  // The public API provided by the context
  const value = {
    // Scene Management
    getScenes,
    getSceneById,
    saveScene,
    deleteScene,
    applyScenePatches,

    // Recently Viewed Management
    logSceneView,
    getRecentScenes,

    // Chat History Management
    getChatHistory,
    getOrCreateExampleChat,
    saveChat,
    deleteChat,
    getChatById,

    // AI Property Management
    propertyManager,
    initializePropertiesFromScene: (scene) => propertyManager.initializeFromScene(scene),
    clearObjectProperties: () => propertyManager.clearObjectProperties(),
    getProperty: (path) => propertyManager.getProperty(path),
    setProperty: (path, value, reason) => propertyManager.setProperty(path, value, reason),
    findProperties: (pattern, condition) => propertyManager.findProperties(pattern, condition),
    getSceneFromProperties: (sceneId) => propertyManager.getSceneData(sceneId),
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}
