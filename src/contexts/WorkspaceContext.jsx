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
  const [loopMode, setLoopMode] = useState('none'); // 'none', '5sec', '10sec'

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

  const toggleLoop = useCallback(() => {
    setLoopMode(prev => {
      if (prev === 'none') return '5sec';
      if (prev === '5sec') return '10sec';
      if (prev === '10sec') return 'none';
      return 'none';
    });
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
    const initializeWorkspace = async () => {
      // For session-only mode we do not load a saved workspace from storage.
      // Always create a fresh default workspace for the session.
      if (!workspaceManager.getCurrentWorkspace()) {
        const defaultWorkspace = workspaceManager.createWorkspace('Default Workspace');
        workspaceManager.setCurrentWorkspace(defaultWorkspace);
        console.log('Initialized fresh session workspace');
      }
    };

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
    return currentWorkspace?.getCurrentScene();
  }, [currentWorkspace]);

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
        console.log('Auto-saved updated scene:', currentScene.id);
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
        console.log('Auto-saved scene:', newScene.id);
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
