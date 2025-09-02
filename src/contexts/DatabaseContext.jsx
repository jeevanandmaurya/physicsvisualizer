import React, { createContext, useContext, useCallback } from 'react';
// NOTE: Path updated from scenes.js to data.js as per refactor plan
import { mechanicsExamples } from '../scenes.js'; 

const DatabaseContext = createContext();

export function useDatabase() {
  return useContext(DatabaseContext);
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
    
    saveLocalScenes(scenes);
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

    // Only add sample data if there are no user-created chats
    // Filter out any demo chats that might have been saved
    const userChats = chats.filter(chat => !chat.id.startsWith('demo-'));

    if (userChats.length === 0 && chats.length === 0) {
      // Only add sample data if there's truly no chat history
      chats = createSampleChatData();
      saveChatHistoryToStorage(chats);
    } else {
      // Use existing user chats, but keep demo chat for demonstration if it exists
      chats = userChats.length > 0 ? userChats : chats;
    }

    return Promise.resolve(chats);
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
    saveChatHistoryToStorage(chats);
  }, []);

  /**
   * Gets a specific chat by ID
   */
  const getChatById = useCallback(async (chatId) => {
    const chats = getChatHistoryFromStorage();
    return chats.find(c => c.id === chatId) || null;
  }, []);

  // The public API provided by the context
  const value = {
    // Scene Management
    getScenes,
    getSceneById,
    saveScene,
    deleteScene,

    // Recently Viewed Management
    logSceneView,
    getRecentScenes,

    // Chat History Management
    getChatHistory,
    saveChat,
    deleteChat,
    getChatById,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}
