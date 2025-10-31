import React, { useState, useCallback, useEffect } from 'react';
import { useWorkspace, useWorkspaceScene, useWorkspaceChat, useWorkspaceSettings } from '../contexts/WorkspaceContext';
import { useDatabase, SceneData } from '../contexts/DatabaseContext';
import SceneSelectorUI from '../views/components/scene-management/SceneSelectorUI';
import SceneDetailsUI from '../views/components/scene-management/SceneDetailsUI';

const SidePanel = ({ showSceneDetails = false, onToggleSceneDetails, onClosePanel, onToggleMaximize, isMaximized = false }) => {
  const { setCurrentView, workspaceScenes, clearScenes } = useWorkspace();
  const { scene, replaceCurrentScene } = useWorkspaceScene();
  const { messages, addMessage } = useWorkspaceChat();
  const { uiMode } = useWorkspaceSettings();
  const dataManager = useDatabase();

  const [currentChatId, setCurrentChatId] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [userScenes, setUserScenes] = useState<SceneData[]>([]);
  const [loadingUserScenes, setLoadingUserScenes] = useState(false);
  const [activeTab, setActiveTab] = useState(uiMode === 'simple' ? 'examples' : 'chats');
  const [sceneListRefreshTrigger, setSceneListRefreshTrigger] = useState(0);

  // Load user scenes
  useEffect(() => {
    const loadUserScenes = async () => {
      if (!dataManager) return;
      setLoadingUserScenes(true);
      try {
        const scenes = await dataManager.getScenes('user', {
          orderBy: { field: 'updatedAt', direction: 'desc' }
        });
        setUserScenes(scenes || []);
      } catch (error) {
        console.error('Error loading user scenes:', error);
        setUserScenes([]);
      } finally {
        setLoadingUserScenes(false);
      }
    };

    loadUserScenes();
  }, [dataManager]); // Only depend on dataManager, not workspaceScenes

  // Refresh user scenes when workspaceScenes change (new scene saved)
  useEffect(() => {
    if (workspaceScenes && workspaceScenes.length > 0) {
      const loadUserScenes = async () => {
        if (!dataManager) return;
        try {
          const scenes = await dataManager.getScenes('user', {
            orderBy: { field: 'updatedAt', direction: 'desc' }
          });
          setUserScenes(scenes || []);
        } catch (error) {
          console.error('Error refreshing user scenes:', error);
        }
      };
      loadUserScenes();
    }
  }, [workspaceScenes, dataManager]);

  const handleSceneChange = useCallback((newScene) => {
    console.log('Changing scene to:', newScene);

    // If this is a new scene (not from saved scenes), clear workspace scenes
    if (newScene.id.startsWith('new-scene-')) {
      clearScenes(); // Clear all workspace scenes
      console.log('Cleared workspace scenes for new scene');
    }

    replaceCurrentScene(newScene);
  }, [replaceCurrentScene, clearScenes]);

  const refreshSceneList = useCallback(async () => {
    if (!dataManager) return;
    try {
      const scenes = await dataManager.getScenes('user', {
        orderBy: { field: 'updatedAt', direction: 'desc' }
      });
      setUserScenes(scenes || []);
      console.log('Refreshed scene list:', scenes?.length || 0, 'scenes');
    } catch (error) {
      console.error('Error refreshing scene list:', error);
    }
  }, [dataManager]);

  const handleChatSelect = useCallback((chat) => {
    if (chat === null) {
      setCurrentChatId(null);
      setConversationHistory([]);
      return;
    }

    setCurrentChatId(chat.id);
    setConversationHistory(chat.messages || []);
  }, []);

  const handleNewChat = useCallback(() => {
    // Create a new chat
    const newChatId = `chat-${Date.now()}`;
    setCurrentChatId(newChatId);
    setConversationHistory([]);
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleSceneButtonClick = useCallback((chat, sceneIndex) => {
    // Handle scene switching from chat
    console.log('Scene button clicked:', chat, sceneIndex);
    if (chat.scenes && chat.scenes[sceneIndex]) {
      handleSceneChange(chat.scenes[sceneIndex]);
    }
  }, [handleSceneChange]);

  const handleSaveScene = useCallback(async (sceneToSave) => {
    if (!dataManager) return;
    try {
      const savedId = await dataManager.saveScene(sceneToSave);
      console.log('Scene saved with ID:', savedId);
      // Refresh user scenes
      const scenes = await dataManager.getScenes('user', {
        orderBy: { field: 'updatedAt', direction: 'desc' }
      });
      setUserScenes(scenes || []);
    } catch (error) {
      console.error('Error saving scene:', error);
      alert('Error saving scene');
    }
  }, [dataManager]);

  const handleUpdateScene = useCallback(async (sceneToUpdate) => {
    if (!dataManager) return;
    try {
      await dataManager.saveScene(sceneToUpdate);
      console.log('Scene updated:', sceneToUpdate.id);
      // Refresh user scenes
      const scenes = await dataManager.getScenes('user', {
        orderBy: { field: 'updatedAt', direction: 'desc' }
      });
      setUserScenes(scenes || []);
    } catch (error) {
      console.error('Error updating scene:', error);
      alert('Error updating scene');
    }
  }, [dataManager]);

  const handleDeleteScene = useCallback(async (sceneToDelete) => {
    if (!dataManager) return;
    if (!window.confirm(`Are you sure you want to delete "${sceneToDelete.name}"?`)) {
      return;
    }
    try {
      await dataManager.deleteScene(sceneToDelete.id);
      console.log('Scene deleted:', sceneToDelete.id);
      // Refresh user scenes
      const scenes = await dataManager.getScenes('user', {
        orderBy: { field: 'updatedAt', direction: 'desc' }
      });
      setUserScenes(scenes || []);
    } catch (error) {
      console.error('Error deleting scene:', error);
      alert('Error deleting scene');
    }
  }, [dataManager]);





  return (
    <div className="side-panel">
      <div className="left-panel">
        <SceneSelectorUI
          currentScene={scene}
          handleSceneChange={handleSceneChange}
          conversationHistory={conversationHistory}
          userScenes={userScenes}
          loadingUserScenes={loadingUserScenes}
          onDeleteScene={handleDeleteScene}
          onSaveScene={handleSaveScene}
          onUpdateScene={handleUpdateScene}
          currentChatId={currentChatId}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          onSceneButtonClick={handleSceneButtonClick}
          refreshTrigger={refreshTrigger}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onToggleSceneDetails={onToggleSceneDetails}
          onClose={onClosePanel}
          onToggleMaximize={onToggleMaximize}
          isMaximized={isMaximized}
          onRefreshSceneList={refreshSceneList}
          workspaceScenes={workspaceScenes} // Pass workspace scenes
        />
        {showSceneDetails && (
          <div className="scene-details-overlay">
            <SceneDetailsUI scene={scene} onToggleSceneDetails={onToggleSceneDetails} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SidePanel;
