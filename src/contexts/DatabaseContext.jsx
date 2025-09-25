import React, { createContext, useContext, useCallback } from 'react';
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




export function DatabaseProvider({ children }) {
  /**
   * Fetches scenes from various sources based on type.
   */
  const getScenes = useCallback(async (type, options = {}) => {
    switch (type) {
      case 'user':
      case 'local':
        let scenes = getLocalScenes();
        if (options.orderBy?.field === 'updatedAt') {
          scenes.sort((a, b) => {
            const dateA = new Date(a.updatedAt);
            const dateB = new Date(b.updatedAt);
            return options.orderBy.direction === 'desc' ? dateB - dateA : dateA - dateB;
          });
        }
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
    const localScenes = getLocalScenes();
    const scene = localScenes.find(s => s.id === sceneId);
    if (scene) return scene;

    const exampleScene = mechanicsExamples.find(s => s.id === sceneId);
    return exampleScene || null;
  }, []);

  /**
   * Saves or updates a scene to the user's collection.
   */
  const saveScene = useCallback(async (sceneObject) => {
    const scenes = getLocalScenes();
    const now = new Date().toISOString();

    const { isExtracted, isTemporary, ...dataToSave } = sceneObject;
    const sceneData = { ...dataToSave, updatedAt: now };

    const existingIndex = scenes.findIndex(s => s.id === sceneObject.id);

    if (existingIndex !== -1) {
      scenes[existingIndex] = { ...scenes[existingIndex], ...sceneData };
    } else {
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
   * Gets all chat history
   */
  const getChatHistory = useCallback(async () => {
    return getChatHistoryFromStorage();
  }, []);

  /**
   * Saves a new chat or updates an existing one
   */
  const saveChat = useCallback(async (chatData) => {
    const chats = getChatHistoryFromStorage();
    const now = new Date().toISOString();

    const chatToSave = { ...chatData, updatedAt: now };

    const existingIndex = chats.findIndex(c => c.id === chatData.id);

    if (existingIndex !== -1) {
      chats[existingIndex] = { ...chats[existingIndex], ...chatToSave };
    } else {
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
   * Gets or creates a chat for a scene - Chat > Scene architecture
   */
  const getOrCreateChatForScene = useCallback(async (sceneId, sceneName = '') => {
    const chats = getChatHistoryFromStorage();

    // Check if chat already exists for this scene
    let existingChat = chats.find(chat => chat.sceneId === sceneId);

    if (existingChat) {
      return existingChat.id;
    }

    // Create new empty chat for the scene
    const newChat = {
      id: `chat-${sceneId}-${Date.now()}`,
      sceneId: sceneId,
      sceneName: sceneName,
      messages: [],
      createdAt: new Date().toISOString()
    };

    await saveChat(newChat);
    return newChat.id;
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

  const value = {
    getScenes,
    getSceneById,
    saveScene,
    deleteScene,
    getChatHistory,
    saveChat,
    deleteChat,
    getOrCreateChatForScene,
    getRecentScenes,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}
