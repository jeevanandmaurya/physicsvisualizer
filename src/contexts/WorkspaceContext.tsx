import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { WorkspaceManager, Workspace } from '../core/workspace/WorkspaceManager';
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
}

export interface WorkspaceContextType {
  // State
  currentWorkspace: WorkspaceObject | null;
  currentView: string;
  workspaceUpdateTrigger: number;
  loading: boolean;
  error: string | null;
  // Visualizer state
  isPlaying: boolean;
  simulationTime: number;
  fps: number;
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
  getUIMode: () => string;
  setUIMode: (mode: string) => void;
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
  // Scene-chat linking methods
  linkSceneToChat: (sceneId: string, chatId: string) => void;
  getChatForScene: (sceneId: string) => string | null;
  // Direct access to manager for advanced operations
  workspaceManager: WorkspaceManager;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const database = useDatabase();
  const [workspaceManager] = useState(() => new WorkspaceManager(database));
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceObject | null>(null);
  const [currentView, setCurrentView] = useState('dashboard'); // Add currentView state
  const [workspaceUpdateTrigger, setWorkspaceUpdateTrigger] = useState(0); // Force re-renders
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Visualizer runtime state
  const [isPlaying, setIsPlaying] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0);
  const [fps, setFps] = useState(0);
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
      const savedId = await database.saveScene(sceneData);
      return savedId;
    } catch (err) {
      console.error('Save failed:', err);
      throw err;
    }
  }, [database]);

  // Initialize workspace manager listeners and create default workspace
  useEffect(() => {
    const initializeWorkspace = async () => {
      // For session-only mode we do not load a saved workspace from storage.
      // Always create a fresh default workspace for the session.
      if (!workspaceManager.getCurrentWorkspace()) {
        const defaultWorkspace = workspaceManager.createWorkspace('Default Workspace');
        workspaceManager.setCurrentWorkspace(defaultWorkspace);
      }
    };

    const handleWorkspaceChange = (event: any, workspace: WorkspaceObject) => {
      // Use the workspace object directly (it has methods)
      setCurrentWorkspace(workspace);
      // Increment trigger to force re-renders
      setWorkspaceUpdateTrigger(prev => prev + 1);
      setError(null);
    };

    const handleWorkspaceError = (event: any, error: any) => {
      setError(error?.message || 'Unknown workspace error');
    };

    workspaceManager.addListener(handleWorkspaceChange);
    workspaceManager.addListener(handleWorkspaceError);

    initializeWorkspace();

  // NOTE: Auto-save is disabled for session-only mode.

    return () => {
      workspaceManager.removeListener(handleWorkspaceChange);
      workspaceManager.removeListener(handleWorkspaceError);
      workspaceManager.stopAutoSave();
    };
  }, [workspaceManager, database]);

  // No persistent saves in session-only mode

  // Workspace operations
  const createWorkspace = useCallback(async (name) => {
    try {
      setLoading(true);
      setError(null);
      const workspace = workspaceManager.createWorkspace(name);
      await workspaceManager.saveCurrentWorkspace();
      return workspace;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [workspaceManager]);

  const loadWorkspace = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const workspace = await workspaceManager.loadWorkspace(id);
      return workspace;
    } catch (err) {
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
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [workspaceManager]);

  const updateWorkspace = useCallback((updater) => {
    workspaceManager.updateCurrentWorkspace(updater);
  }, [workspaceManager]);





  // Scene management methods
  const getCurrentScene = useCallback(() => {
    return workspaceManager.getCurrentWorkspace()?.getCurrentScene();
  }, [workspaceManager]);

  const setCurrentScene = useCallback((index) => {
    updateWorkspace(workspace => workspace.setCurrentScene(index));
  }, [updateWorkspace]);

  const addScene = useCallback((sceneData) => {
    updateWorkspace(workspace => workspace.addScene(sceneData));
  }, [updateWorkspace]);

  const updateCurrentScene = useCallback(async (updates) => {
    updateWorkspace(workspace => {
      const currentScene = workspace.getCurrentScene();

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

  const replaceCurrentScene = useCallback(async (newScene) => {
    updateWorkspace(workspace => workspace.replaceCurrentScene(newScene));

    // Auto-save the scene if it's not the default empty scene
    if (newScene && newScene.id && !newScene.id.startsWith('new-scene-')) {
      try {
        await saveCurrentScene(newScene);
      } catch (error) {
        console.warn('Auto-save failed:', error);
      }
    }
  }, [updateWorkspace, saveCurrentScene]);



  const deleteScene = useCallback((index) => {
    updateWorkspace(workspace => workspace.deleteScene(index));
  }, [updateWorkspace]);

  const clearScenes = useCallback(() => {
    updateWorkspace(workspace => {
      workspace.scenes = [];
      workspace.currentSceneIndex = -1;
      return workspace;
    });
  }, [updateWorkspace]);

  // Legacy method for backward compatibility
  const updateScene = useCallback((updates) => {
    return updateCurrentScene(updates);
  }, [updateCurrentScene]);

  const addMessage = useCallback((message) => {
    workspaceManager.updateCurrentWorkspace(workspace => {
      // Only add message if it doesn't already exist
      const exists = workspace.chat?.messages?.some(m => m.id === message.id);
      if (!exists) {
        return workspace.addMessage(message);
      }
      return workspace;
    }, true); // Silent update for messages
    // In session-only mode we do not persist to storage.
  }, [workspaceManager]);

  const updateSettings = useCallback((settings) => {
    updateWorkspace(workspace => workspace.updateSettings(settings));
  }, [updateWorkspace]);

  const getUIMode = useCallback(() => {
    return currentWorkspace?.settings?.uiMode || 'simple';
  }, [currentWorkspace]);

  const setUIMode = useCallback((mode) => {
    updateSettings({ uiMode: mode });
  }, [updateSettings]);

  // Chat management methods exposed from WorkspaceManager
  const addChatSession = useCallback(() => {
    return workspaceManager.addChatSession();
  }, [workspaceManager]);

  const deleteChatSession = useCallback((chatId) => {
    return workspaceManager.deleteChatSession(chatId);
  }, [workspaceManager]);

  const selectChatSession = useCallback((chatId) => {
    return workspaceManager.selectChatSession(chatId);
  }, [workspaceManager]);

  const getCurrentChat = useCallback(() => {
    return workspaceManager.getCurrentChat();
  }, [workspaceManager]);

  const getAllChats = useCallback(() => {
    return workspaceManager.getAllChats();
  }, [workspaceManager]);

  // Scene-chat linking methods
  const linkSceneToChat = useCallback((sceneId, chatId) => {
    workspaceManager.updateCurrentWorkspace(workspace => workspace.linkSceneToChat(sceneId, chatId), true); // Silent update
  }, [workspaceManager]);

  const getChatForScene = useCallback((sceneId) => {
    if (!currentWorkspace || typeof currentWorkspace.getChatForScene !== 'function') {
      return null;
    }
    return currentWorkspace.getChatForScene(sceneId);
  }, [currentWorkspace]);



  const contextValue = {
    // State
    currentWorkspace,
    currentView,
    workspaceUpdateTrigger, // Include trigger for re-renders
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
    getUIMode,
    setUIMode,

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

    // Scene-chat linking methods
    linkSceneToChat,
    getChatForScene,

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
  const { currentWorkspace, workspaceUpdateTrigger, getCurrentScene, updateCurrentScene, replaceCurrentScene, setCurrentScene, addScene, deleteScene } = useWorkspace();

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
  const { currentWorkspace, addMessage, selectChatSession, getCurrentChat, getAllChats, addChatSession, deleteChatSession } = useWorkspace();

  return {
    // Use the current chat's messages
    messages: getCurrentChat()?.messages || [],
    addMessage,
    chatSettings: getCurrentChat()?.settings,
    // Expose chat management functions
    selectChatSession,
    getCurrentChat,
    getAllChats,
    addChatSession,
    deleteChatSession
  };
}

export function useWorkspaceSettings() {
  const { currentWorkspace, updateSettings, getUIMode, setUIMode } = useWorkspace();

  return {
    settings: currentWorkspace?.settings,
    updateSettings,
    uiMode: getUIMode(),
    setUIMode
  };
}
