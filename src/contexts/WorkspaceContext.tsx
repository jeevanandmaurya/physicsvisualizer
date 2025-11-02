import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { WorkspaceManager } from '../core/workspace/WorkspaceManager';
import { useDatabase } from './DatabaseContext';
import { SceneData } from './DatabaseContext';

// Define types for WorkspaceContext
export interface GraphData {
  id: string;
  initialType: string;
}

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
  // State
  currentWorkspace: WorkspaceObject | null;
  currentView: string;
  loading: boolean;
  error: string | null;
  // Visualizer state
  isPlaying: boolean;
  simulationTime: number;
  fps: number;
  simulationSpeed: number;
  showVelocityVectors: boolean;
  vectorScale: number;
  openGraphs: GraphData[];
  resetTrigger: number;
  objectHistory: Record<string, any>;
  loopMode: string;
  dataTimeStep: number;
  // View management
  setCurrentView: (view: string) => void;
  // Workspace data
  workspaceScenes: SceneData[];
  // Workspace operations
  createWorkspace: (name: string) => Promise<WorkspaceObject>;
  loadWorkspace: (id: string) => Promise<WorkspaceObject>;
  saveWorkspace: () => Promise<void>;
  updateWorkspace: (updater: (workspace: WorkspaceObject) => WorkspaceObject) => void;
  // Scene management methods
  getCurrentScene: () => SceneData | null;
  setCurrentScene: (index: number) => void;
  addScene: (sceneData: SceneData) => void;
  updateCurrentScene: (updates: any) => Promise<void>;
  replaceCurrentScene: (newScene: SceneData) => Promise<void>;
  deleteScene: (index: number) => void;
  clearScenes: () => void;
  // Convenience methods
  updateScene: (updates: any) => Promise<void>;
  addMessage: (message: WorkspaceChatMessage) => void;
  updateSettings: (settings: WorkspaceSettings) => void;
  // Visualizer actions
  togglePlayPause: () => void;
  play: () => void;
  pause: () => void;
  resetSimulation: () => void;
  loopReset: () => void;
  updateSimulationTime: (time: number) => void;
  updateFps: (newFps: number) => void;
  toggleVelocityVectors: () => void;
  updateVectorScale: (scale: number) => void;
  setSimulationSpeed: (speed: number) => void;
  addGraph: (type: string) => void;
  removeGraph: (id: string) => void;
  saveCurrentScene: (sceneData: SceneData) => Promise<string>;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  toggleLoop: () => void;
  updateDataTimeStep: (step: number) => void;
  // Chat management methods
  addChatSession: () => WorkspaceChat | null;
  deleteChatSession: (chatId: string) => boolean;
  selectChatSession: (chatId: string) => boolean;
  getCurrentChat: () => WorkspaceChat | null | undefined;
  getAllChats: () => WorkspaceChat[];
  updateChatName: (chatId: string, name: string) => boolean;
  // Scene-chat linking methods
  linkSceneToChat: (sceneId: string, chatId: string) => void;
  getChatForScene: (sceneId: string) => string | null;
  getScenesForChat: (chatId: string) => any[];
  // Navigation methods for chat-visualizer integration
  navigateToVisualizerWithScene: (sceneId: string, chatId: string, options?: { openChat?: boolean }) => void;
  navigationContext: {
    fromView?: string;
    linkedChatId?: string;
  };
  // Direct access to manager for advanced operations
  workspaceManager: WorkspaceManager;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const database = useDatabase();
  const [workspaceManager] = useState(() => new WorkspaceManager(database));
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceObject | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Navigation context for chat-visualizer linking
  const [navigationContext, setNavigationContext] = useState<{
    fromView?: string;
    linkedChatId?: string;
  }>({});

  // Visualizer runtime state
  const [isPlaying, setIsPlaying] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0);
  const [fps, setFps] = useState(0);
  const [simulationSpeed, setSimulationSpeed] = useState(1); // 0.25x, 0.5x, 1x
  const [showVelocityVectors, setShowVelocityVectors] = useState(false);
  const [vectorScale, setVectorScale] = useState(1);
  const [openGraphs, setOpenGraphs] = useState<GraphData[]>([]);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [objectHistory, setObjectHistory] = useState<Record<string, any>>({});
  const [loopMode, setLoopMode] = useState('none'); // 'none', '5sec', '10sec'
  const [dataTimeStep, setDataTimeStep] = useState(0.01); // Time step for data sampling in seconds

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const resetSimulation = useCallback(() => {
    setIsPlaying(false);
    setSimulationTime(0);
    setFps(0);
    setResetTrigger(Date.now());
    // Note: Actual object reset happens in Visualizer
  }, []);

  const loopReset = useCallback(() => {
    setSimulationTime(0);
    setFps(0);
    setResetTrigger(Date.now());
    // Note: Keeps playing, just resets positions and time
  }, []);

  const updateSimulationTime = useCallback((time: number) => {
    setSimulationTime(time);
  }, []);

  const updateFps = useCallback((newFps: number) => {
    setFps(newFps);
  }, []);

  const toggleVelocityVectors = useCallback(() => {
    setShowVelocityVectors(prev => !prev);
  }, []);

  const updateVectorScale = useCallback((scale: number) => {
    setVectorScale(scale);
  }, []);

  const addGraph = useCallback((type: string) => {
    const id = `graph-${Date.now()}`;
    setOpenGraphs(prev => [...prev, { id, initialType: type }]);
  }, []);

  const removeGraph = useCallback((id: string) => {
    setOpenGraphs(prev => prev.filter((g: GraphData) => g.id !== id));
  }, []);

  const toggleLoop = useCallback(() => {
    setLoopMode(prev => {
      if (prev === 'none') return '5sec';
      if (prev === '5sec') return '10sec';
      if (prev === '10sec') return 'none';
      return 'none';
    });
  }, []);

  const updateDataTimeStep = useCallback((step: number) => {
    setDataTimeStep(step);
  }, []);

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
              console.log('✅ Loaded workspace from IndexedDB');
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

  const addScene = useCallback((sceneData: SceneData) => {
    updateWorkspace((workspace: any) => workspace.addScene(sceneData));
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
    
    // Update React state to trigger re-render
    setCurrentWorkspace({...workspace});
    
    // Save to IndexedDB immediately
    workspaceManager.saveCurrentWorkspace().catch(err => {
      console.error('Failed to save workspace after adding chat:', err);
    });
    
    return newChat;
  }, [workspaceManager]);

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

  // Navigation function for chat-visualizer integration
  const navigateToVisualizerWithScene = useCallback((
    sceneId: string, 
    chatId: string, 
    options?: { openChat?: boolean }
  ) => {
    console.log('🚀 Navigating to visualizer with scene:', sceneId, 'chat:', chatId);
    
    // 1. Find and set the scene
    const scenes = currentWorkspace?.scenes || [];
    const sceneIndex = scenes.findIndex(s => s.id === sceneId);
    
    if (sceneIndex >= 0) {
      setCurrentScene(sceneIndex);
      console.log('✅ Scene set:', sceneIndex);
    } else {
      console.warn('⚠️ Scene not found in workspace:', sceneId);
    }
    
    // 2. Link scene to chat
    linkSceneToChat(sceneId, chatId);
    
    // 3. Store navigation context
    setNavigationContext({
      fromView: currentView,
      linkedChatId: chatId
    });
    
    // 4. Switch to visualizer view
    setCurrentView('visualizer');
    
    // 5. Store chat open preference (will be used by Workbench)
    if (options?.openChat) {
      // Store in sessionStorage so Workbench can read it
      sessionStorage.setItem('openChatOverlay', 'true');
    }
    
    console.log('✅ Navigation complete');
  }, [currentWorkspace, currentView, setCurrentScene, linkSceneToChat, setNavigationContext]);

  const contextValue = {
    // State
    currentWorkspace,
    currentView,
    loading,
    error,

    // Visualizer state
    isPlaying,
    simulationTime,
    fps,
    showVelocityVectors,
    vectorScale,
    openGraphs,
    resetTrigger,
    objectHistory,
    setObjectHistory,
    loopMode,
    dataTimeStep,
    simulationSpeed,
    setSimulationSpeed,

    // View management
    setCurrentView,

    // Workspace data
    workspaceScenes: currentWorkspace?.scenes || [],
    // workspaceChats: currentWorkspace?.chat?.messages || [], // This was for the old single chat structure

    // Workspace operations
    createWorkspace,
    loadWorkspace,
    saveWorkspace,
    updateWorkspace,

    // Scene management methods
    getCurrentScene,
    setCurrentScene,
    addScene,
    updateCurrentScene,
    replaceCurrentScene,
    deleteScene,
    clearScenes,

    // Convenience methods
    updateScene,
    addMessage,
    updateSettings,

    // Visualizer actions
    togglePlayPause,
    play,
    pause,
    resetSimulation,
    loopReset,
    updateSimulationTime,
    updateFps,
    toggleVelocityVectors,
    updateVectorScale,
    addGraph,
    removeGraph,
    saveCurrentScene,
    setIsPlaying,
    toggleLoop,
    updateDataTimeStep,

    // Chat management methods
    addChatSession,
    deleteChatSession,
    selectChatSession,
    getCurrentChat,
    getAllChats,
    updateChatName,

    // Scene-chat linking methods
    linkSceneToChat,
    getChatForScene,
    getScenesForChat,
    
    // Navigation methods for chat-visualizer integration
    navigateToVisualizerWithScene,
    navigationContext,

    // Direct access to manager for advanced operations
    workspaceManager
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
  const { addMessage, selectChatSession, getCurrentChat, getAllChats, addChatSession, deleteChatSession } = useWorkspace();

  return {
    // Use the current chat's messages
    messages: getCurrentChat()?.messages || [],
    addMessage,
    // Expose chat management functions
    selectChatSession,
    getCurrentChat,
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
