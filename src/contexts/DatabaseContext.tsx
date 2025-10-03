import React, { createContext, useContext, useCallback } from 'react';
import { mechanicsExamples } from '../scenes.js';

// Define types for DatabaseContext
export interface SceneData {
  id?: string;
  name?: string;
  description?: string;
  objects?: any[];
  forces?: any[];
  constraints?: any[];
  settings?: any;
  camera?: any;
  createdAt?: string;
  updatedAt?: string;
  isExtracted?: boolean;
  isTemporary?: boolean;
  controllers?: any[]; // Added controllers property
}

export interface ChatData {
  id?: string;
  sceneId?: string;
  sceneName?: string;
  messages?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkspaceData {
  id: string;
  name?: string;
  scenes?: SceneData[];
  settings?: any;
  chat?: any;
  [key: string]: any;
}

export interface DatabaseContextType {
  getScenes: (type: string, options?: { orderBy?: { field: string; direction: string }; limitTo?: number }) => Promise<SceneData[]>;
  getSceneById: (sceneId: string) => Promise<SceneData | null>;
  saveScene: (sceneObject: SceneData) => Promise<string>;
  deleteScene: (sceneId: string) => Promise<void>;
  getChatHistory: () => Promise<ChatData[]>;
  saveChat: (chatData: ChatData) => Promise<string>;
  deleteChat: (chatId: string) => Promise<void>;
  getOrCreateChatForScene: (sceneId: string, sceneName?: string) => Promise<string>;
  saveWorkspace: (workspaceData: WorkspaceData) => Promise<string>;
  getWorkspace: (workspaceId?: string) => Promise<WorkspaceData | null>;
  getRecentScenes: () => SceneData[];
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export function useDatabase() {
  return useContext(DatabaseContext);
}

const LOCAL_STORAGE_KEY = 'physicsVisualizerScenes';
const CHAT_HISTORY_KEY = 'physicsVisualizerChatHistory';
const WORKSPACE_KEY = 'physicsVisualizerWorkspace';

// Helper function to get scenes from localStorage
const getLocalScenes = (): SceneData[] => {
    try {
        const scenesJson = localStorage.getItem(LOCAL_STORAGE_KEY);
        return scenesJson ? JSON.parse(scenesJson) : [];
    } catch (error) {
        console.error("Error reading scenes from localStorage", error);
        return [];
    }
};

// Helper function to save scenes to localStorage
const saveLocalScenes = (scenes: SceneData[]) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(scenes));
    } catch (error) {
        console.error("Error saving scenes to localStorage", error);
    }
};

// Helper function to get chat history from localStorage
const getChatHistoryFromStorage = (): ChatData[] => {
    try {
        const chatHistoryJson = localStorage.getItem(CHAT_HISTORY_KEY);
        return chatHistoryJson ? JSON.parse(chatHistoryJson) : [];
    } catch (error) {
        console.error("Error reading chat history from localStorage", error);
        return [];
    }
};

// Helper function to save chat history to localStorage
const saveChatHistoryToStorage = (chatHistory: ChatData[]) => {
    try {
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatHistory));
    } catch (error) {
        console.error("Error saving chat history to localStorage", error);
    }
};




export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  /**
   * Fetches scenes from various sources based on type.
   */
  const getScenes = useCallback(async (type: string, options: { orderBy?: { field: string; direction: string }; limitTo?: number } = {}) => {
    switch (type) {
      case 'user':
      case 'local':
        let scenes = getLocalScenes();
        if (options.orderBy?.field === 'updatedAt') {
          scenes.sort((a: SceneData, b: SceneData) => {
            const dateA = new Date(a.updatedAt || 0);
            const dateB = new Date(b.updatedAt || 0);
            return options.orderBy!.direction === 'desc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
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
   * Gets a specific chat by ID
   */
  const getChatById = useCallback(async (chatId) => {
    const chats = getChatHistoryFromStorage();
    return chats.find(chat => chat.id === chatId) || null;
  }, []);

  /**
   * Saves a new chat or updates an existing one
   */
  const saveChat = useCallback(async (chatData: ChatData): Promise<string> => {
    const chats = getChatHistoryFromStorage();
    const now = new Date().toISOString();

    const chatToSave = { ...chatData, updatedAt: now };

    const existingIndex = chats.findIndex(c => c.id === chatData.id);

    if (existingIndex !== -1) {
      chats[existingIndex] = { ...chats[existingIndex], ...chatToSave } as ChatData;
    } else {
      chatToSave.id = chatToSave.id || `chat-${Date.now()}`;
      chatToSave.createdAt = now;
      chats.push(chatToSave as ChatData);
    }

    saveChatHistoryToStorage(chats);
    return chatToSave.id!;
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
   * Saves a workspace
   */
  const saveWorkspace = useCallback(async (workspaceData) => {
    try {
      localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspaceData));
      return workspaceData.id;
    } catch (error) {
      console.error("Error saving workspace to localStorage", error);
      throw error;
    }
  }, []);

  /**
   * Gets the current workspace
   */
  const getWorkspace = useCallback(async (workspaceId) => {
    try {
      const workspaceJson = localStorage.getItem(WORKSPACE_KEY);
      if (workspaceJson) {
        const workspace = JSON.parse(workspaceJson);
        // If workspaceId is provided, check if it matches, otherwise return the saved workspace
        if (!workspaceId || workspace.id === workspaceId) {
          return workspace;
        }
      }
      return null;
    } catch (error) {
      console.error("Error reading workspace from localStorage", error);
      return null;
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

  const value = {
    getScenes,
    getSceneById,
    saveScene,
    deleteScene,
    getChatHistory,
    saveChat,
    deleteChat,
    getOrCreateChatForScene,
    saveWorkspace,
    getWorkspace,
    getRecentScenes,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}
