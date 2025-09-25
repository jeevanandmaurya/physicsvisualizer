import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { WorkspaceManager } from '../core/workspace/WorkspaceManager';
import { useDatabase } from './DatabaseContext';

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const database = useDatabase();
  const [workspaceManager] = useState(() => new WorkspaceManager(database));
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
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
  const [openGraphs, setOpenGraphs] = useState([]);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [objectHistory, setObjectHistory] = useState({});

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

  const updateSimulationTime = useCallback((time) => {
    setSimulationTime(time);
  }, []);

  const updateFps = useCallback((newFps) => {
    setFps(newFps);
  }, []);

  const toggleVelocityVectors = useCallback(() => {
    setShowVelocityVectors(prev => !prev);
  }, []);

  const updateVectorScale = useCallback((scale) => {
    setVectorScale(scale);
  }, []);

  const addGraph = useCallback((type) => {
    const id = `graph-${Date.now()}`;
    setOpenGraphs(prev => [...prev, { id, initialType: type }]);
  }, []);

  const removeGraph = useCallback((id) => {
    setOpenGraphs(prev => prev.filter(g => g.id !== id));
  }, []);

  const saveCurrentScene = useCallback(async (sceneData) => {
    try {
      const savedId = await database.saveScene(sceneData);
      console.log('Scene saved:', savedId);
      return savedId;
    } catch (err) {
      console.error('Save failed:', err);
      throw err;
    }
  }, [database]);

  // Initialize workspace manager listeners and create default workspace
  useEffect(() => {
    const handleWorkspaceChange = (event, workspace) => {
      // Use the workspace object directly (it has methods)
      setCurrentWorkspace(workspace);
      // Increment trigger to force re-renders
      setWorkspaceUpdateTrigger(prev => prev + 1);
      setError(null);
    };

    const handleWorkspaceError = (event, error) => {
      setError(error.message);
    };

    workspaceManager.addListener(handleWorkspaceChange);
    workspaceManager.addListener(handleWorkspaceError);

    // Create default workspace if none exists
    if (!workspaceManager.getCurrentWorkspace()) {
      const defaultWorkspace = workspaceManager.createWorkspace('Default Workspace');
      workspaceManager.setCurrentWorkspace(defaultWorkspace);
    }

    // Start auto-save
    workspaceManager.startAutoSave();

    return () => {
      workspaceManager.removeListener(handleWorkspaceChange);
      workspaceManager.removeListener(handleWorkspaceError);
      workspaceManager.stopAutoSave();
    };
  }, [workspaceManager]);

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
    return currentWorkspace?.getCurrentScene();
  }, [currentWorkspace]);

  const setCurrentScene = useCallback((index) => {
    updateWorkspace(workspace => workspace.setCurrentScene(index));
  }, [updateWorkspace]);

  const addScene = useCallback((sceneData) => {
    updateWorkspace(workspace => workspace.addScene(sceneData));
  }, [updateWorkspace]);

  const updateCurrentScene = useCallback((updates) => {
    updateWorkspace(workspace => workspace.updateCurrentScene(updates));
  }, [updateWorkspace]);

  const replaceCurrentScene = useCallback((newScene) => {
    updateWorkspace(workspace => workspace.replaceCurrentScene(newScene));
  }, [updateWorkspace]);



  const deleteScene = useCallback((index) => {
    updateWorkspace(workspace => workspace.deleteScene(index));
  }, [updateWorkspace]);

  // Legacy method for backward compatibility
  const updateScene = useCallback((updates) => {
    return updateCurrentScene(updates);
  }, [updateCurrentScene]);

  const addMessage = useCallback((message) => {
    updateWorkspace(workspace => workspace.addMessage(message));
  }, [updateWorkspace]);

  const updateSettings = useCallback((settings) => {
    updateWorkspace(workspace => workspace.updateSettings(settings));
  }, [updateWorkspace]);

  const getUIMode = useCallback(() => {
    return currentWorkspace?.settings?.uiMode || 'simple';
  }, [currentWorkspace]);

  const setUIMode = useCallback((mode) => {
    updateSettings({ uiMode: mode });
  }, [updateSettings]);

  // Scene-chat linking methods
  const linkSceneToChat = useCallback((sceneId, chatId) => {
    updateWorkspace(workspace => workspace.linkSceneToChat(sceneId, chatId));
  }, [updateWorkspace]);

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

    // View management
    setCurrentView,

    // Workspace data
    workspaceScenes: currentWorkspace?.scenes || [],
    workspaceChats: currentWorkspace?.chat?.messages || [],

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
    updateSimulationTime,
    updateFps,
    toggleVelocityVectors,
    updateVectorScale,
    addGraph,
    removeGraph,
    saveCurrentScene,
    setIsPlaying,

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
  const { currentWorkspace, addMessage } = useWorkspace();

  return {
    messages: currentWorkspace?.chat?.messages || [],
    addMessage,
    chatSettings: currentWorkspace?.chat?.settings
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
