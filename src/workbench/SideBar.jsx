import React, { Suspense, useState, useCallback, useEffect } from 'react';
import { useWorkspace, useWorkspaceScene, useWorkspaceChat, useWorkspaceSettings } from '../contexts/WorkspaceContext';
import { useDatabase } from '../contexts/DatabaseContext';

// Lazy load components
const SceneSelector = React.lazy(() => import('../features/collection/components/SceneSelector'));

// Loading component
const ComponentLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px' }}>
    <span>Loading...</span>
  </div>
);

const SideBar = ({ activeView, collapsed, onToggleCollapse }) => {
  const { setCurrentView } = useWorkspace();
  const { scene, updateScene } = useWorkspaceScene();
  const { messages, addMessage } = useWorkspaceChat();
  const { uiMode } = useWorkspaceSettings();
  const dataManager = useDatabase();

  const [currentChatId, setCurrentChatId] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [userScenes, setUserScenes] = useState([]);
  const [loadingUserScenes, setLoadingUserScenes] = useState(false);

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

    if (activeView === 'visualizer') {
      loadUserScenes();
    }
  }, [dataManager, activeView]);

  const handleSceneChange = useCallback((newScene) => {
    console.log('Changing scene to:', newScene);
    updateScene(newScene);
  }, [updateScene]);

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

  const getSidebarContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <div>Dashboard Explorer</div>;
      case 'collection':
        return <div>Scene Explorer</div>;
      case 'visualizer':
        return (
          <Suspense fallback={<ComponentLoader />}>
            <SceneSelector
              currentScene={scene}
              handleSceneChange={handleSceneChange}
              conversationHistory={conversationHistory}
              userScenes={userScenes}
              loadingUserScenes={loadingUserScenes}
              extractedScenes={[]}
              onExtractedScene={() => {}}
              onDeleteScene={handleDeleteScene}
              onSaveScene={handleSaveScene}
              onUpdateScene={handleUpdateScene}
              onShareToPublic={() => {}}
              onOpenProperties={() => {}}
              currentChatId={currentChatId}
              onChatSelect={handleChatSelect}
              onNewChat={handleNewChat}
              onSceneButtonClick={handleSceneButtonClick}
              refreshTrigger={refreshTrigger}
              activeTab={uiMode === 'simple' ? 'examples' : 'chats'}
              onTabChange={() => {}}
              uiMode={uiMode}
            />
          </Suspense>
        );
      case 'history':
        return <div>Chat History</div>;
      case 'settings':
        return <div>Settings Categories</div>;
      case 'analytics':
        return <div>Analytics Filters</div>;
      default:
        return <div>Explorer</div>;
    }
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {!collapsed && (
        <>
          <div className="sidebar-header">
            <span>{activeView.charAt(0).toUpperCase() + activeView.slice(1)}</span>
            <button className="toggle-button" onClick={onToggleCollapse}>×</button>
          </div>
          <div className="sidebar-content">
            {getSidebarContent()}
          </div>
        </>
      )}
      {collapsed && (
        <button className="toggle-button" onClick={onToggleCollapse} style={{ margin: '10px' }}>
          ☰
        </button>
      )}
    </div>
  );
};

export default SideBar;
