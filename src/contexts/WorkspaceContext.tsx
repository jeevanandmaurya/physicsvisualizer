import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { WorkspaceManager } from '../core/workspace/WorkspaceManager';
import { useDatabase } from './DatabaseContext';
import { SceneData } from './DatabaseContext';

/**
 * WorkspaceContext - Manages workspace data (scenes, chats, persistence)
 * 
 * This context is now focused ONLY on data operations.
 * Simulation state moved to SimulationContext.
 * Navigation state moved to NavigationContext.
 */

export interface WorkspaceSettings {
  uiMode?: string;
  [key: string]: any;
}

export interface WorkspaceChatMessage {
  id: string;
  content?: string;
  timestamp?: number;
  isUser?: boolean;
  
  // Scene generation metadata for linking chat to visualizer
  sceneMetadata?: {
    hasSceneGeneration: boolean;
    sceneId: string;
    sceneAction: 'create' | 'modify' | 'none';
    sceneSummary: {
      name: string;
      objectCount: number;
      objectTypes: string[];
      thumbnailUrl?: string;
    };
    sceneData?: any; // NEW: Include the actual scene data to avoid async loading issues
  };
  
  aiMetadata?: any;
  sceneId?: string;
  [key: string]: any;
}

// Updated WorkspaceChat interface to match WorkspaceManager
export interface WorkspaceChat {
  id: string;
  name: string;
  messages: WorkspaceChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// Updated WorkspaceObject interface to include chats and currentChatId
export interface WorkspaceObject {
  id: string;
  name?: string;
  settings?: WorkspaceSettings;
  scenes?: SceneData[];
  currentSceneIndex?: number;
  chats: WorkspaceChat[]; // Array of chats
  currentChatId: string | null; // ID of the currently active chat
  getCurrentScene?: () => SceneData | null;
  setCurrentScene?: (index: number) => void;
  addScene?: (sceneData: SceneData) => void;
  updateCurrentScene?: (updates: any) => void;
  replaceCurrentScene?: (newScene: SceneData) => void;
  deleteScene?: (index: number) => void;
  updateSettings?: (settings: WorkspaceSettings) => void;
  addMessage?: (message: WorkspaceChatMessage) => void;
  addChat?: (chatData?: any) => WorkspaceChat; // Method to add a new chat
  getChatById?: (chatId: string) => WorkspaceChat | undefined; // Method to get a chat by ID
  setCurrentChat?: (chatId: string) => boolean; // Method to set the current chat
  deleteChat?: (chatId: string) => boolean; // Method to delete a chat
  linkSceneToChat?: (sceneId: string, chatId: string) => void;
  getChatForScene?: (sceneId: string) => string | null;
  getScenesForChat?: (chatId: string) => any[];
}

export interface WorkspaceContextType {
  // Core workspace state
  currentWorkspace: WorkspaceObject | null;
  loading: boolean;
  error: string | null;
  workspaceManager: WorkspaceManager;
  
  // Workspace data
  workspaceScenes: SceneData[];
  
  // Workspace operations
  createWorkspace: (name: string) => Promise<WorkspaceObject>;
  loadWorkspace: (id: string) => Promise<WorkspaceObject>;
  saveWorkspace: () => Promise<void>;
  updateWorkspace: (updater: (workspace: WorkspaceObject) => WorkspaceObject) => void;
  
  // Scene management
  getCurrentScene: () => SceneData | null;
  setCurrentScene: (index: number) => void;
  addScene: (sceneData: SceneData, switchScene?: boolean) => void;
  updateCurrentScene: (updates: any) => void;
  updateSceneById: (sceneId: string, updates: any) => void;
  replaceCurrentScene: (newScene: SceneData) => Promise<void>;
  deleteScene: (index: number) => void;
  clearScenes: () => void;
  updateScene: (updates: any) => Promise<void>;
  saveCurrentScene: (sceneData: SceneData) => Promise<string>;
  
  // Chat management
  addMessage: (message: WorkspaceChatMessage) => void;
  updateSettings: (settings: WorkspaceSettings) => void;
  addChatSession: () => WorkspaceChat | null;
  deleteChatSession: (chatId: string) => boolean;
  selectChatSession: (chatId: string) => boolean;
  getCurrentChat: () => WorkspaceChat | null | undefined;
  getAllChats: () => WorkspaceChat[];
  updateChatName: (chatId: string, name: string) => boolean;
  
  // View-specific current chat methods
  getChatViewCurrentChat: () => WorkspaceChat | null;
  setChatViewCurrentChat: (chatId: string, skipSceneReload?: boolean) => boolean;
  getChatOverlayCurrentChat: () => WorkspaceChat | null;
  setChatOverlayCurrentChat: (chatId: string, skipSceneReload?: boolean) => boolean;
  
  // Scene-chat linking
  linkSceneToChat: (sceneId: string, chatId: string) => void;
  getChatForScene: (sceneId: string) => string | null;
  getScenesForChat: (chatId: string) => any[];
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const database = useDatabase();
  const [workspaceManager] = useState(() => new WorkspaceManager(database));
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceObject | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveCurrentScene = useCallback(async (sceneData: SceneData): Promise<string> => {
    try {
      if (!database) throw new Error('Database not initialized');
      const savedId = await database.saveScene(sceneData);
      return savedId;
    } catch (err) {
      console.error('Save failed:', err);
      throw err;
    }
  }, [database]);

  // Subscribe to workspace updates
  useEffect(() => {
    const handleWorkspaceUpdate = (event: string, workspace: any) => {
      if (event === 'workspaceUpdated') {
        setCurrentWorkspace({ ...workspace }); // Create new object reference to trigger re-renders
      }
    };

    workspaceManager.addListener(handleWorkspaceUpdate);

    return () => {
      workspaceManager.removeListener(handleWorkspaceUpdate);
    };
  }, [workspaceManager]);

  // Initialize workspace manager and sync state
  useEffect(() => {
    const initializeWorkspace = async () => {
      // Try to load saved workspace from IndexedDB
      if (!workspaceManager.getCurrentWorkspace()) {
        try {
          if (database) {
            const savedWorkspace = await database.getWorkspace('default');
            if (savedWorkspace) {
              // Load from IndexedDB
              const workspace = await workspaceManager.loadWorkspace(savedWorkspace.id);
              setCurrentWorkspace(workspace);
              // Workspace loaded
              return;
            }
          }
        } catch (err) {
          console.warn('Could not load workspace from IndexedDB, creating new:', err);
        }
        
        // Create fresh default workspace if loading failed
        const defaultWorkspace = workspaceManager.createWorkspace('Default Workspace');
        // Override ID to always use 'default' for the main workspace
        defaultWorkspace.id = 'default';
        setCurrentWorkspace(defaultWorkspace);
        console.log('✅ Created new default workspace');
        
        // Save the new workspace to IndexedDB with 'default' key
        try {
          await workspaceManager.saveCurrentWorkspace();
          console.log('✅ Saved default workspace to IndexedDB with id: default');
        } catch (err) {
          console.error('❌ Failed to save default workspace:', err);
        }
      }
    };

    initializeWorkspace();
  }, [workspaceManager, database]);

  // No persistent saves in session-only mode

  // Workspace operations
  const createWorkspace = useCallback(async (name: string) => {
    try {
      setLoading(true);
      setError(null);
      const workspace = workspaceManager.createWorkspace(name);
      await workspaceManager.saveCurrentWorkspace();
      return workspace;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [workspaceManager]);

  const loadWorkspace = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const workspace = await workspaceManager.loadWorkspace(id);
      return workspace;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [workspaceManager]);

  const saveWorkspace = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await workspaceManager.saveCurrentWorkspace();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [workspaceManager]);

  const updateWorkspace = useCallback((updater: any) => {
    workspaceManager.updateCurrentWorkspace(updater);
  }, [workspaceManager]);





  // Scene management methods
  const getCurrentScene = useCallback(() => {
    return workspaceManager.getCurrentWorkspace()?.getCurrentScene();
  }, [workspaceManager]);

  const setCurrentScene = useCallback((index: number) => {
    updateWorkspace((workspace: any) => workspace.setCurrentScene(index));
  }, [updateWorkspace]);

  const addScene = useCallback((sceneData: SceneData, switchScene: boolean = true) => {
    updateWorkspace((workspace: any) => workspace.addScene(sceneData, switchScene));
  }, [updateWorkspace]);

  const updateCurrentScene = useCallback(async (updates: any) => {
    updateWorkspace((workspace: any) => {
      // Keep the scene as "New Scene" - don't rename it
      return workspace.updateCurrentScene(updates);
    });

    // Auto-save the scene after updates
    const currentScene = getCurrentScene();
    if (currentScene && currentScene.id) {
      try {
        await saveCurrentScene(currentScene);
      } catch (error) {
        console.warn('Auto-save failed:', error);
      }
    }
  }, [updateWorkspace, getCurrentScene, saveCurrentScene]);

  const updateSceneById = useCallback(async (sceneId: string, updates: any) => {
    updateWorkspace((workspace: any) => workspace.updateSceneById(sceneId, updates));
    
    // Find the scene to save it
    const scene = currentWorkspace?.scenes?.find(s => s.id === sceneId);
    if (scene) {
      try {
        await saveCurrentScene(scene);
      } catch (error) {
        console.warn('Auto-save failed for scene:', sceneId, error);
      }
    }
  }, [updateWorkspace, currentWorkspace, saveCurrentScene]);

  const replaceCurrentScene = useCallback(async (newScene: SceneData) => {
    updateWorkspace((workspace: any) => workspace.replaceCurrentScene(newScene));

    // Auto-save the scene if it's not the default empty scene
    if (newScene && newScene.id && !newScene.id.startsWith('new-scene-')) {
      try {
        await saveCurrentScene(newScene);
      } catch (error) {
        console.warn('Auto-save failed:', error);
      }
    }
  }, [updateWorkspace, saveCurrentScene]);



  const deleteScene = useCallback((index: number) => {
    updateWorkspace((workspace: any) => workspace.deleteScene(index));
  }, [updateWorkspace]);

  const clearScenes = useCallback(() => {
    updateWorkspace((workspace: any) => {
      workspace.scenes = [];
      workspace.currentSceneIndex = -1;
      return workspace;
    });
  }, [updateWorkspace]);

  // Legacy method for backward compatibility
  const updateScene = useCallback((updates: any) => {
    return updateCurrentScene(updates);
  }, [updateCurrentScene]);

  // ==================== CHAT SYSTEM - CLEAN REWRITE ====================
  // Direct state updates, no events, proper IndexedDB sync
  
  const addMessage = useCallback((message: WorkspaceChatMessage) => {
    const workspace = workspaceManager.getCurrentWorkspace();
    if (!workspace) {
      console.warn('Cannot add message: no workspace');
      return;
    }
    
    const currentChat = workspace.getChatById(workspace.currentChatId);
    if (!currentChat) {
      console.warn('Cannot add message: no current chat');
      return;
    }
    
    // Check if message already exists (prevent duplicates)
    const exists = currentChat.messages?.some((m: any) => m.id === message.id);
    if (exists) {
      console.log('Message already exists, skipping:', message.id);
      return;
    }
    
    // Add message directly to workspace
    workspace.addMessage(message);
    
    // Update React state to trigger re-render (spread creates new reference)
    setCurrentWorkspace({...workspace});
    
    // Save to IndexedDB immediately (no delay)
    workspaceManager.saveCurrentWorkspace().catch(err => {
      console.error('Failed to save workspace after adding message:', err);
    });
  }, [workspaceManager]);

  const updateSettings = useCallback((settings: WorkspaceSettings) => {
    updateWorkspace((workspace: any) => workspace.updateSettings(settings));
  }, [updateWorkspace]);

  // UI mode functionality removed - not needed

  // Helper to create a default empty scene for new chats
  const createDefaultScene = useCallback(() => ({
    id: `scene-${Date.now()}`,
    name: 'New Scene',
    description: 'A new physics simulation.',
    gravity: [0, -9.81, 0],
    hasGround: true,
    simulationScale: 'terrestrial',
    gravitationalPhysics: { enabled: false },
    objects: []
  }), []);

  // Chat session management - clean and direct
  const addChatSession = useCallback(() => {
    const workspace = workspaceManager.getCurrentWorkspace();
    if (!workspace) {
      console.warn('Cannot add chat session: no workspace');
      return null;
    }
    
    // Add new chat to workspace
    const newChat = workspace.addChat();
    
    // Switch to the new chat
    workspace.setCurrentChat(newChat.id);
    
    // Clear scenes and create a default empty scene for the new chat
    workspace.scenes = [];
    workspace.currentSceneIndex = -1;
    const defaultScene = createDefaultScene();
    workspace.addScene(defaultScene, true);
    
    // Link the new scene to this chat
    workspace.linkSceneToChat(defaultScene.id, newChat.id);
    
    // Update React state to trigger re-render
    setCurrentWorkspace({...workspace});
    
    // Save to IndexedDB immediately
    workspaceManager.saveCurrentWorkspace().catch(err => {
      console.error('Failed to save workspace after adding chat:', err);
    });
    
    return newChat;
  }, [workspaceManager, createDefaultScene]);

  const deleteChatSession = useCallback((chatId: string) => {
    const workspace = workspaceManager.getCurrentWorkspace();
    if (!workspace) {
      console.warn('Cannot delete chat session: no workspace');
      return false;
    }
    
    // Delete chat from workspace (handles switching to another chat if needed)
    const success = workspace.deleteChat(chatId);
    if (!success) {
      console.warn('Failed to delete chat:', chatId);
      return false;
    }
    
    // Update React state to trigger re-render
    setCurrentWorkspace({...workspace});
    
    // Save to IndexedDB immediately
    workspaceManager.saveCurrentWorkspace().catch(err => {
      console.error('Failed to save workspace after deleting chat:', err);
    });
    
    return true;
  }, [workspaceManager]);

  const selectChatSession = useCallback((chatId: string) => {
    const workspace = workspaceManager.getCurrentWorkspace();
    if (!workspace) {
      console.warn('Cannot select chat session: no workspace');
      return false;
    }
    
    // Set current chat in workspace
    const success = workspace.setCurrentChat(chatId);
    if (!success) {
      console.warn('Failed to select chat:', chatId);
      return false;
    }
    
    // Update React state to trigger re-render
    setCurrentWorkspace({...workspace});
    
    // Save to IndexedDB immediately
    workspaceManager.saveCurrentWorkspace().catch(err => {
      console.error('Failed to save workspace after selecting chat:', err);
    });
    
    return true;
  }, [workspaceManager]);

  const getCurrentChat = useCallback(() => {
    const workspace = workspaceManager.getCurrentWorkspace();
    if (!workspace) return null;
    
    // Get current chat from workspace
    return workspace.getChatById(workspace.currentChatId);
  }, [workspaceManager, currentWorkspace]);

  const getAllChats = useCallback(() => {
    const workspace = workspaceManager.getCurrentWorkspace();
    return workspace?.chats || [];
  }, [workspaceManager, currentWorkspace]);

  const updateChatName = useCallback((chatId: string, name: string) => {
    const workspace = workspaceManager.getCurrentWorkspace();
    if (!workspace) {
      console.warn('Cannot update chat name: no workspace');
      return false;
    }
    
    const success = workspace.updateChatName(chatId, name);
    if (!success) {
      console.warn('Failed to update chat name:', chatId);
      return false;
    }
    
    // Update React state to trigger re-render
    setCurrentWorkspace({...workspace});
    
    // Save to IndexedDB immediately
    workspaceManager.saveCurrentWorkspace().catch(err => {
      console.error('Failed to save workspace after updating chat name:', err);
    });
    
    return true;
  }, [workspaceManager]);

  // Get current chat for ChatView (from shared history)
  const getChatViewCurrentChat = useCallback(() => {
    const workspace = workspaceManager.getCurrentWorkspace();
    if (!workspace) return null;
    return workspace.getChatViewCurrentChat();
  }, [workspaceManager, currentWorkspace]);

  // Set current chat for ChatView
  const setChatViewCurrentChat = useCallback((chatId: string, skipSceneReload: boolean = false) => {
    const workspace = workspaceManager.getCurrentWorkspace();
    if (!workspace) return false;
    
    const success = workspace.setChatViewCurrentChat(chatId);
    if (success) {
      // Skip scene reload if caller already loaded the scene (e.g., example scene selection)
      if (!skipSceneReload) {
        // Get scenes linked to this chat BEFORE clearing
        const linkedScenes = workspace.getScenesForChat(chatId);
        
        // Clear current scenes 
        workspace.scenes = [];
        workspace.currentSceneIndex = -1;
        
        if (linkedScenes && linkedScenes.length > 0) {
          // Load the most recent scene for this chat (make a copy to avoid reference issues)
          const latestScene = { ...linkedScenes[linkedScenes.length - 1] };
          workspace.addScene(latestScene, true);
          console.log('ChatView: Loaded scene for chat:', latestScene.name || latestScene.id);
        } else {
          // No linked scene, create a default empty scene
          const defaultScene = createDefaultScene();
          workspace.addScene(defaultScene, true);
          console.log('ChatView: Created new default scene for chat');
        }
      }
      
      setCurrentWorkspace({...workspace});
      workspaceManager.saveCurrentWorkspace().catch(err => {
        console.error('Failed to save workspace:', err);
      });
    }
    return success;
  }, [workspaceManager, createDefaultScene]);

  // Get current chat for ChatOverlay (from shared history)
  const getChatOverlayCurrentChat = useCallback(() => {
    const workspace = workspaceManager.getCurrentWorkspace();
    if (!workspace) return null;
    return workspace.getChatOverlayCurrentChat();
  }, [workspaceManager, currentWorkspace]);

  // Set current chat for ChatOverlay
  const setChatOverlayCurrentChat = useCallback((chatId: string, skipSceneReload: boolean = false) => {
    const workspace = workspaceManager.getCurrentWorkspace();
    if (!workspace) return false;
    
    const success = workspace.setChatOverlayCurrentChat(chatId);
    if (success) {
      // Skip scene reload if caller already loaded the scene (e.g., example scene selection)
      if (!skipSceneReload) {
        // Get scenes linked to this chat BEFORE clearing
        const linkedScenes = workspace.getScenesForChat(chatId);
        
        // Clear current scenes
        workspace.scenes = [];
        workspace.currentSceneIndex = -1;
        
        if (linkedScenes && linkedScenes.length > 0) {
          // Load the most recent scene for this chat (make a copy to avoid reference issues)
          const latestScene = { ...linkedScenes[linkedScenes.length - 1] };
          workspace.addScene(latestScene, true);
          console.log('ChatOverlay: Loaded scene for chat:', latestScene.name || latestScene.id);
        } else {
          // No linked scene, create a default empty scene
          const defaultScene = createDefaultScene();
          workspace.addScene(defaultScene, true);
          console.log('ChatOverlay: Created new default scene for chat');
        }
      }
      
      setCurrentWorkspace({...workspace});
      workspaceManager.saveCurrentWorkspace().catch(err => {
        console.error('Failed to save workspace:', err);
      });
    }
    return success;
  }, [workspaceManager, createDefaultScene]);

  // Scene-chat linking methods
  const linkSceneToChat = useCallback((sceneId: string, chatId: string) => {
    workspaceManager.updateCurrentWorkspace((workspace: any) => workspace.linkSceneToChat(sceneId, chatId), true); // Silent update
  }, [workspaceManager]);

  const getChatForScene = useCallback((sceneId: string) => {
    if (!currentWorkspace || typeof currentWorkspace.getChatForScene !== 'function') {
      return null;
    }
    return currentWorkspace.getChatForScene(sceneId);
  }, [currentWorkspace]);

  const getScenesForChat = useCallback((chatId: string) => {
    if (!currentWorkspace || typeof currentWorkspace.getScenesForChat !== 'function') {
      return [];
    }
    return currentWorkspace.getScenesForChat(chatId);
  }, [currentWorkspace]);

  const contextValue = {
    // Core workspace state
    currentWorkspace,
    loading,
    error,
    workspaceManager,

    // Workspace data
    workspaceScenes: currentWorkspace?.scenes || [],

    // Workspace operations
    createWorkspace,
    loadWorkspace,
    saveWorkspace,
    updateWorkspace,

    // Scene management
    getCurrentScene,
    setCurrentScene,
    addScene,
    updateCurrentScene,
    updateSceneById,
    replaceCurrentScene,
    deleteScene,
    clearScenes,
    updateScene,
    saveCurrentScene,

    // Chat management
    addMessage,
    updateSettings,
    addChatSession,
    deleteChatSession,
    selectChatSession,
    getCurrentChat,
    getAllChats,
    updateChatName,
    getChatViewCurrentChat,
    setChatViewCurrentChat,
    getChatOverlayCurrentChat,
    setChatOverlayCurrentChat,

    // Scene-chat linking
    linkSceneToChat,
    getChatForScene,
    getScenesForChat,
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

// Hook for workspace-aware components
export function useWorkspaceScene() {
  const { currentWorkspace, getCurrentScene, updateCurrentScene, replaceCurrentScene, setCurrentScene, addScene, deleteScene } = useWorkspace();

  return {
    scene: getCurrentScene(),
    scenes: currentWorkspace?.scenes || [],
    currentSceneIndex: currentWorkspace?.currentSceneIndex || 0,
    updateScene: updateCurrentScene,
    replaceCurrentScene,
    setCurrentScene,
    addScene,
    deleteScene,
    sceneId: getCurrentScene()?.id
  };
}

export function useWorkspaceChat() {
  const { addMessage, selectChatSession, getChatViewCurrentChat, getAllChats, addChatSession, deleteChatSession } = useWorkspace();

  return {
    // Use the current chat's messages (defaults to ChatView's current chat)
    messages: getChatViewCurrentChat()?.messages || [],
    addMessage,
    // Expose chat management functions
    selectChatSession,
    getChatViewCurrentChat,
    getAllChats,
    addChatSession,
    deleteChatSession
  };
}

export function useWorkspaceSettings() {
  const { currentWorkspace, updateSettings } = useWorkspace();

  return {
    settings: currentWorkspace?.settings,
    updateSettings
  };
}
