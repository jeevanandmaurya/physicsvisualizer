import React, { createContext, useContext, useCallback } from 'react';
import { SceneLoader, type LoadedScene } from '../core/scene/SceneLoader';
import { IndexedDBService } from '../core/database/IndexedDBService';

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
  gravity?: number[];
  hasGround?: boolean;
  contactMaterial?: any;
  gravitationalPhysics?: any;
  simulationScale?: string;
  version?: string;
  context?: any;
  thumbnail?: string;
  thumbnailUrl?: string; // UI compatibility - same as thumbnail
  folderName?: string;
}

export interface MessageData {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'context';
  content: string;
  timestamp: string;
  metadata?: any;
}

export interface ChatData {
  id?: string;
  sceneId?: string;
  sceneName?: string;
  messages?: MessageData[];
  createdAt?: string;
  updatedAt?: string;
}

// New Container Structure: Each chat session is a container with scene + chat
export interface ChatContainer {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  sceneContainer: {
    sceneId: string;
    sceneName: string;
    sceneData: SceneData;
    context?: {
      theory?: string;
      explanation?: string;
      facts?: string[];
      details?: string;
    };
  };
  chatContext: {
    messages: MessageData[];
    conversationSummary?: string;
  };
  metadata?: {
    lastInteraction?: string;
    messageCount?: number;
    [key: string]: any;
  };
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
  // New Chat Container methods
  getChatContainer: (containerId: string) => Promise<ChatContainer | null>;
  getAllChatContainers: () => Promise<ChatContainer[]>;
  saveChatContainer: (container: ChatContainer) => Promise<string>;
  deleteChatContainer: (containerId: string) => Promise<void>;
  createChatContainerForScene: (sceneId: string) => Promise<ChatContainer>;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export function useDatabase() {
  return useContext(DatabaseContext);
}

// IndexedDB is now used instead of localStorage
// Helper functions are replaced with async IndexedDB calls

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  /**
   * Fetches scenes from various sources based on type.
   */
  const getScenes = useCallback(async (type: string, options: { orderBy?: { field: string; direction: string }; limitTo?: number } = {}) => {
    switch (type) {
      case 'user':
      case 'local':
        let scenes = await IndexedDBService.getAllUserScenes() as SceneData[];
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
        return scenes;

      case 'examples':
        // Load scenes from the scenes folder using SceneLoader
        const exampleScenes = await SceneLoader.getAllScenes();
        // Map thumbnail to thumbnailUrl for UI compatibility
        return exampleScenes.map(scene => ({
          ...scene,
          thumbnailUrl: scene.thumbnail
        }));

      default:
        console.error(`Unknown scene type: ${type}`);
        return [];
    }
  }, []);

  /**
   * Fetches a single scene by its ID.
   */
  const getSceneById = useCallback(async (sceneId: string): Promise<SceneData | LoadedScene | null> => {
    // Check user scenes in IndexedDB
    const localScene = await IndexedDBService.getUserScene(sceneId) as SceneData | null;
    if (localScene) return localScene;

    // Try to load from SceneLoader (examples from scenes folder)
    const exampleScene = await SceneLoader.getSceneById(sceneId) as LoadedScene | null;
    return exampleScene || null;
  }, []);

  /**
   * Saves or updates a scene to the user's collection.
   */
  const saveScene = useCallback(async (sceneObject: SceneData) => {
    const now = new Date().toISOString();

    const { isExtracted, isTemporary, ...dataToSave } = sceneObject;
    const sceneData = { ...dataToSave, updatedAt: now };

    // Check if scene already exists
    const existingScene = sceneData.id ? await IndexedDBService.getUserScene(sceneData.id) : null;

    if (existingScene) {
      // Update existing scene
      const updatedScene = { ...existingScene, ...sceneData };
      await IndexedDBService.saveUserScene(updatedScene);
      return updatedScene.id!;
    } else {
      // Create new scene
      sceneData.id = sceneData.id && !sceneData.id.startsWith('new-') ? sceneData.id : `local-${Date.now()}`;
      sceneData.createdAt = now;
      await IndexedDBService.saveUserScene(sceneData);
      return sceneData.id!;
    }
  }, []);

  /**
   * Deletes a scene from the user's collection.
   */
  const deleteScene = useCallback(async (sceneId: string) => {
    if (!sceneId) throw new Error("Scene ID is required for deletion.");
    await IndexedDBService.deleteUserScene(sceneId);
  }, []);

  /**
   * Gets all chat history
   */
  const getChatHistory = useCallback(async () => {
    return await IndexedDBService.getChatHistory() as ChatData[];
  }, []);

  /**
   * Saves a new chat or updates an existing one
   */
  const saveChat = useCallback(async (chatData: ChatData): Promise<string> => {
    const now = new Date().toISOString();
    const chatToSave = { ...chatData, updatedAt: now };

    if (!chatToSave.id) {
      chatToSave.id = `chat-${Date.now()}`;
      chatToSave.createdAt = now;
    }

    await IndexedDBService.saveChat(chatToSave);
    return chatToSave.id!;
  }, []);

  /**
   * Deletes a chat from history
   */
  const deleteChat = useCallback(async (chatId: string) => {
    if (!chatId) throw new Error("Chat ID is required for deletion.");
    await IndexedDBService.deleteChat(chatId);
  }, []);

  /**
   * Gets or creates a chat for a scene - Chat > Scene architecture
   * Now uses Chat Containers with scene context as first message
   */
  const getOrCreateChatForScene = useCallback(async (sceneId: string, _sceneName = '') => {
    // Check if a container already exists for this scene
    const containers = await IndexedDBService.getChatContainersBySceneId(sceneId);
    if (containers && containers.length > 0) {
      return (containers[0] as ChatContainer).id;
    }

    // Load scene data
    const sceneData = await getSceneById(sceneId) as SceneData | LoadedScene | null;
    
    if (!sceneData) {
      throw new Error(`Scene with ID ${sceneId} not found`);
    }

    const now = new Date().toISOString();
    const containerId = `container-${sceneId}-${Date.now()}`;

    // Create context message from scene context
    const contextMessages: MessageData[] = [];
    
    if (sceneData.context) {
      let contextContent = `# ${sceneData.name}\n\n`;
      contextContent += `${sceneData.description}\n\n`;
      
      if (sceneData.context.theory) {
        contextContent += `## Theory\n${sceneData.context.theory}\n\n`;
      }
      
      if (sceneData.context.explanation) {
        contextContent += `## Explanation\n${sceneData.context.explanation}\n\n`;
      }
      
      if (sceneData.context.facts && sceneData.context.facts.length > 0) {
        contextContent += `## Key Facts\n`;
        sceneData.context.facts.forEach((fact: string) => {
          contextContent += `- ${fact}\n`;
        });
      }

      // Add context as first message
      contextMessages.push({
        id: `context-${Date.now()}`,
        role: 'context',
        content: contextContent,
        timestamp: now,
        metadata: { isSceneContext: true }
      });
    }

    const container: ChatContainer = {
      id: containerId,
      name: `Chat: ${sceneData.name}`,
      createdAt: now,
      updatedAt: now,
      sceneContainer: {
        sceneId: sceneData.id || sceneId,
        sceneName: sceneData.name || 'Unnamed Scene',
        sceneData: sceneData,
        context: sceneData.context
      },
      chatContext: {
        messages: contextMessages,
        conversationSummary: ''
      },
      metadata: {
        lastInteraction: now,
        messageCount: contextMessages.length
      }
    };

    // Save container to IndexedDB
    await IndexedDBService.saveChatContainer(container);
    
    return container.id;
  }, [getSceneById]);

  /**
   * Saves a workspace
   */
  const saveWorkspace = useCallback(async (workspaceData: WorkspaceData) => {
    try {
      await IndexedDBService.saveWorkspace(workspaceData);
      return workspaceData.id;
    } catch (error) {
      console.error("Error saving workspace to IndexedDB", error);
      throw error;
    }
  }, []);

  /**
   * Gets the current workspace
   */
  const getWorkspace = useCallback(async (workspaceId?: string) => {
    try {
      const workspace = await IndexedDBService.getWorkspace(workspaceId || 'default') as WorkspaceData | null;
      return workspace;
    } catch (error) {
      console.error("Error reading workspace from IndexedDB", error);
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

  /**
   * Get a specific chat container by ID
   */
  const getChatContainer = useCallback(async (containerId: string): Promise<ChatContainer | null> => {
    return await IndexedDBService.getChatContainer(containerId) as ChatContainer | null;
  }, []);

  /**
   * Get all chat containers
   */
  const getAllChatContainers = useCallback(async (): Promise<ChatContainer[]> => {
    return await IndexedDBService.getAllChatContainers() as ChatContainer[];
  }, []);

  /**
   * Save or update a chat container
   */
  const saveChatContainer = useCallback(async (container: ChatContainer): Promise<string> => {
    const now = new Date().toISOString();
    
    container.updatedAt = now;
    container.metadata = {
      ...container.metadata,
      lastInteraction: now,
      messageCount: container.chatContext.messages.length
    };

    if (!container.createdAt) {
      container.createdAt = now;
    }

    await IndexedDBService.saveChatContainer(container);
    return container.id;
  }, []);

  /**
   * Delete a chat container
   */
  const deleteChatContainer = useCallback(async (containerId: string): Promise<void> => {
    await IndexedDBService.deleteChatContainer(containerId);
  }, []);

  /**
   * Create a new chat container for a scene with context as first message
   */
  const createChatContainerForScene = useCallback(async (sceneId: string): Promise<ChatContainer> => {
    // Load the scene data (from examples or user scenes)
    const sceneData = await getSceneById(sceneId) as SceneData | LoadedScene | null;
    
    if (!sceneData) {
      throw new Error(`Scene with ID ${sceneId} not found`);
    }

    const now = new Date().toISOString();
    const containerId = `container-${sceneId}-${Date.now()}`;

    // Create context message from scene context
    const contextMessages: MessageData[] = [];
    
    if (sceneData.context) {
      let contextContent = `# ${sceneData.name}\n\n`;
      contextContent += `${sceneData.description}\n\n`;
      
      if (sceneData.context.theory) {
        contextContent += `## Theory\n${sceneData.context.theory}\n\n`;
      }
      
      if (sceneData.context.explanation) {
        contextContent += `## Explanation\n${sceneData.context.explanation}\n\n`;
      }
      
      if (sceneData.context.facts && sceneData.context.facts.length > 0) {
        contextContent += `## Key Facts\n`;
        sceneData.context.facts.forEach((fact: string) => {
          contextContent += `- ${fact}\n`;
        });
      }

      // Add context as first message
      contextMessages.push({
        id: `context-${Date.now()}`,
        role: 'context',
        content: contextContent,
        timestamp: now,
        metadata: { isSceneContext: true }
      });
    }

    const container: ChatContainer = {
      id: containerId,
      name: `Chat: ${sceneData.name}`,
      createdAt: now,
      updatedAt: now,
      sceneContainer: {
        sceneId: sceneData.id || sceneId,
        sceneName: sceneData.name || 'Unnamed Scene',
        sceneData: sceneData,
        context: sceneData.context
      },
      chatContext: {
        messages: contextMessages,
        conversationSummary: ''
      },
      metadata: {
        lastInteraction: now,
        messageCount: contextMessages.length
      }
    };

    await saveChatContainer(container);
    return container;
  }, [getSceneById, saveChatContainer]);

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
    // Chat Container methods
    getChatContainer,
    getAllChatContainers,
    saveChatContainer,
    deleteChatContainer,
    createChatContainerForScene,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}
