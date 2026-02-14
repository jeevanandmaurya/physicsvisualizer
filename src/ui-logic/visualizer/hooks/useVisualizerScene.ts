import { useCallback } from 'react';
import { SceneData } from '../../../contexts/DatabaseContext';

export interface UseVisualizerSceneResult {
  // Scene handlers
  handleSceneUpdate: (updatedScene: SceneData) => void;
  handleSceneChange: (newScene: SceneData) => void;
  handleSaveScene: (sceneToSave?: SceneData | null) => Promise<void>;
  handleAISceneUpdate: (propertyPath: string, value: any, reason?: string) => Promise<void>;
  handleAcceptChanges: () => Promise<void>;
  handleRejectChanges: () => void;
}

export function useVisualizerScene({
  scene,
  updateWorkspaceScene,
  replaceCurrentScene,
  clearScenes,
  dataManager,
  capturedThumbnail,
  setCapturedThumbnail,
  pendingChanges,
  setPendingChanges,
  setIsPreviewMode
}: {
  scene: SceneData | null;
  updateWorkspaceScene: (scene: SceneData) => void;
  replaceCurrentScene: (scene: SceneData) => void;
  clearScenes: () => void;
  dataManager: any;
  capturedThumbnail: string | null;
  setCapturedThumbnail: (v: string | null) => void;
  pendingChanges: any;
  setPendingChanges: (v: any) => void;
  setIsPreviewMode: (v: boolean) => void;
}): UseVisualizerSceneResult {

  const handleSceneUpdate = useCallback((updatedScene: SceneData) => {
    updateWorkspaceScene(updatedScene);
  }, [updateWorkspaceScene]);

  const handleSceneChange = useCallback((newScene: SceneData) => {
    clearScenes();
    replaceCurrentScene(newScene);
  }, [replaceCurrentScene, clearScenes]);

  const handleSaveScene = useCallback(async (sceneToSave: SceneData | null = null) => {
    const targetScene = sceneToSave || scene;
    if (!targetScene || !dataManager) return;

    let sceneToSaveData = { ...targetScene };

    if (capturedThumbnail) {
      sceneToSaveData.thumbnailUrl = capturedThumbnail;
      setCapturedThumbnail(null);
    }

    if (sceneToSaveData.isTemporary) {
      delete sceneToSaveData.id;
    }

    try {
      await dataManager.saveScene(sceneToSaveData);
    } catch (err) {
      console.error("Failed to save scene:", err);
      alert("Error: Could not save the scene.");
    }
  }, [scene, dataManager, capturedThumbnail, setCapturedThumbnail]);

  const handleAISceneUpdate = useCallback(async (propertyPath: string, value: any, reason?: string) => {
    if (!dataManager) return;

    try {
      if (propertyPath === 'scene.fullUpdate') {
        const updatedScene = { ...scene, ...value };
        updateWorkspaceScene(updatedScene);
        return;
      }

      if (dataManager?.setProperty && dataManager?.getSceneFromProperties && scene?.id) {
        await dataManager.setProperty(propertyPath, value, reason);
        const updatedScene = dataManager.getSceneFromProperties(scene.id);
        if (updatedScene) {
          updateWorkspaceScene(updatedScene);
        }
      }
    } catch (error) {
      console.error('Failed to apply AI scene modification:', error);
    }
  }, [dataManager, scene, updateWorkspaceScene]);

  const handleAcceptChanges = useCallback(async () => {
    if (!pendingChanges || !scene || !dataManager) return;

    try {
      const updatedScene = await dataManager.applyScenePatches(scene, pendingChanges);

      if (capturedThumbnail) {
        updatedScene.thumbnailUrl = capturedThumbnail;
        setCapturedThumbnail(null);
      }

      const savedSceneId = await dataManager.saveScene(updatedScene);
      updateWorkspaceScene(updatedScene);
      setPendingChanges(null);
      setIsPreviewMode(false);
    } catch (error) {
      console.error('Failed to accept changes:', error);
      alert('Failed to apply changes. Please try again.');
    }
  }, [pendingChanges, scene, dataManager, capturedThumbnail, updateWorkspaceScene, setCapturedThumbnail, setPendingChanges, setIsPreviewMode]);

  const handleRejectChanges = useCallback(() => {
    setPendingChanges(null);
    setIsPreviewMode(false);
  }, [setPendingChanges, setIsPreviewMode]);

  return {
    handleSceneUpdate,
    handleSceneChange,
    handleSaveScene,
    handleAISceneUpdate,
    handleAcceptChanges,
    handleRejectChanges
  };
}
