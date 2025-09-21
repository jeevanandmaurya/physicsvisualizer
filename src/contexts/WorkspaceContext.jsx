import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { WorkspaceManager } from '../core/workspace/WorkspaceManager';
import { useDatabase } from './DatabaseContext';

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const database = useDatabase();
  const [workspaceManager] = useState(() => new WorkspaceManager(database));
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize workspace manager listeners
  useEffect(() => {
    const handleWorkspaceChange = (event, workspace) => {
      setCurrentWorkspace(workspace);
      setError(null);
    };

    const handleWorkspaceError = (event, error) => {
      setError(error.message);
    };

    workspaceManager.addListener(handleWorkspaceChange);
    workspaceManager.addListener(handleWorkspaceError);

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

  const deleteWorkspace = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await workspaceManager.deleteWorkspace(id);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [workspaceManager]);

  const getAllWorkspaces = useCallback(async () => {
    try {
      return await workspaceManager.getAllWorkspaces();
    } catch (err) {
      setError(err.message);
      return [];
    }
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

  const duplicateCurrentScene = useCallback(() => {
    updateWorkspace(workspace => workspace.duplicateCurrentScene());
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

  const contextValue = {
    // State
    currentWorkspace,
    loading,
    error,

    // Workspace operations
    createWorkspace,
    loadWorkspace,
    saveWorkspace,
    updateWorkspace,
    deleteWorkspace,
    getAllWorkspaces,

    // Convenience methods
    updateScene,
    addMessage,
    updateSettings,
    getUIMode,
    setUIMode,

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
  const { currentWorkspace, getCurrentScene, updateCurrentScene, setCurrentScene, addScene, duplicateCurrentScene, deleteScene } = useWorkspace();

  return {
    scene: getCurrentScene(),
    scenes: currentWorkspace?.scenes || [],
    currentSceneIndex: currentWorkspace?.currentSceneIndex || 0,
    updateScene: updateCurrentScene,
    setCurrentScene,
    addScene,
    duplicateCurrentScene,
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
