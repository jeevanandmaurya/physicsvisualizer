import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faSignInAlt, faSignOutAlt, faSpinner, faSearch, faSort, faSortAlphaDown, faSortAlphaUp, faCalendarAlt, faCalendar } from '@fortawesome/free-solid-svg-icons';

import { useDatabase } from '../contexts/DatabaseContext';
import { useWorkspaceScene } from '../contexts/WorkspaceContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useSceneCache } from '../contexts/SceneCacheContext';
import { InfiniteSceneGrid } from './components/explore/InfiniteSceneGrid';
import './CollectionView.css';

// --- Main CollectionView Component ---

function CollectionView() {
  const { setCurrentView } = useNavigation();
  const { updateScene } = useWorkspaceScene();
  const dataManager = useDatabase();
  const { 
    exampleScenes, userScenes, 
    loadExampleScenes, loadUserScenes,
    exampleDisplayCount, userDisplayCount,
    incrementExampleDisplayCount, incrementUserDisplayCount, 
    loading,
    dataLoaded
  } = useSceneCache();

  // const [publicScenes, setPublicScenes] = useState([]); // Moved to Context
  // const [userScenes, setUserScenes] = useState([]); // Moved to Context
  // const [loadingPublic, setLoadingPublic] = useState(true); // Moved to Context
  // const [loadingUser, setLoadingUser] = useState(true); // Moved to Context
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('publicScenes');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'date', 'name-desc', 'date-desc'
  
  // --- Effect to fetch data using Context ---
  useEffect(() => {
    loadExampleScenes();
    loadUserScenes();
  }, [loadExampleScenes, loadUserScenes]);

  const handleSceneClick = useCallback(async (chatId, isPublic) => {
    try {
      console.log('🎯 Loading chat/scene:', chatId, 'isPublic:', isPublic);

      // Find the chat/scene in the appropriate array
      const scenesArray = isPublic ? exampleScenes : userScenes;
      const chatItem = scenesArray.find(s => s.id === chatId);

      if (!chatItem) {
        console.error('❌ Chat/scene not found:', chatId);
        return;
      }
      
      // ... same logic ...
      console.log('✅ Found chat/scene:', chatItem.name);

      let actualScene;
      let sceneId;

      if (isPublic && chatItem.isExample) {
        // For example chats, get the actual scene data
        sceneId = chatItem.sceneId;
        actualScene = await dataManager.getSceneById(sceneId);
        if (!actualScene) {
          console.error('❌ Example scene not found:', sceneId);
          return;
        }
      } else {
        // For user scenes, use the scene directly
        actualScene = chatItem;
        sceneId = chatItem.id;
      }

      // Create or get chat for this scene
      const actualChatId = await dataManager.getOrCreateChatForScene(sceneId, actualScene.name);
      console.log('💬 Chat ready:', actualChatId);

      // Load scene into workspace
      updateScene(actualScene);

      // Switch to visualizer view
      setCurrentView('visualizer');

      console.log('🚀 Scene loaded and view switched to visualizer');
    } catch (error) {
      console.error('❌ Error loading scene:', error);
    }
  }, [setCurrentView, updateScene, exampleScenes, userScenes, dataManager]);

  // Filter and sort scenes based on search term and sort option
  const filteredAndSortedScenes = useMemo(() => {
    const scenes = activeTab === 'publicScenes' ? exampleScenes : userScenes;

    // Filter by search term
    const filtered = scenes.filter(scene => {
      const sceneName = (scene.name || scene.title || '').toLowerCase();
      const sceneDesc = (scene.description || '').toLowerCase();
      const searchLower = searchTerm.toLowerCase();

      return sceneName.includes(searchLower) || sceneDesc.includes(searchLower);
    });

    // Sort scenes
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || a.title || '').localeCompare(b.name || b.title || '');
        case 'name-desc':
          return (b.name || b.title || '').localeCompare(a.name || a.title || '');
        case 'date':
          return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
        case 'date-desc':
          return new Date(a.updatedAt || a.createdAt || 0) - new Date(b.updatedAt || b.createdAt || 0);
        default:
          return 0;
      }
    });

    return sorted;
  }, [activeTab, exampleScenes, userScenes, searchTerm, sortBy]);

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };

  // Renders the scene grid using the reusable InfiniteSceneGrid component
  const renderInfiniteGrid = (isUserTab = false) => {
      const currentScenes = filteredAndSortedScenes;
      const isLoading = isUserTab ? loading.user : loading.examples;
      const isLoaded = isUserTab ? dataLoaded?.user : dataLoaded?.examples;
      const currentDisplayCount = isUserTab ? userDisplayCount : exampleDisplayCount;
      const loadMoreAction = isUserTab ? incrementUserDisplayCount : incrementExampleDisplayCount;

      let emptyMsg = "No scenes found.";
      if (filteredAndSortedScenes.length === 0) {
        if (searchTerm) {
             emptyMsg = "No scenes match your search. Try different keywords.";
        } else if (isUserTab) {
             emptyMsg = "You haven't created any scenes yet. Go create one! 🚀";
        } else {
             emptyMsg = "No public scenes are available at the moment. 🌌";
        }
      }

      if (error && activeTab === (isUserTab ? 'myScenes' : 'publicScenes')) {
          return <p className="error-state-message">{error}</p>;
      }

      return (
          <InfiniteSceneGrid
              scenes={currentScenes}
              loading={isLoading}
              dataLoaded={isLoaded}
              displayCount={currentDisplayCount}
              onLoadMore={loadMoreAction}
              emptyMessage={emptyMsg}
              onSceneClick={handleSceneClick}
              isPublic={!isUserTab}
              skeletonsCount={8}
          />
      );
  };

  return (
    <div className="collection-page-container">
      <nav className="collection-page-nav-tabs">
        <button className={`tab-button ${activeTab === 'publicScenes' ? 'active-tab' : ''}`} onClick={() => setActiveTab('publicScenes')}>
          Example Scenes
        </button>
        <button className={`tab-button ${activeTab === 'myScenes' ? 'active-tab' : ''}`} onClick={() => setActiveTab('myScenes')}>
          Your Scenes
        </button>
      </nav>

      <main className="collection-page-main-content">
        {activeTab === 'publicScenes' && (
          <section className="content-section">
            <div className="section-header">
              <div className="section-title-group">
                <h2 className="section-title">Example Scenes</h2>
                <p className="section-description">Explore simulations created by educators and the community.</p>
              </div>

              <div className="collection-controls">
                <div className="search-container">
                  <FontAwesomeIcon icon={faSearch} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search scenes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>

                <div className="sort-container">
                  <FontAwesomeIcon icon={faSort} className="sort-icon" />
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="sort-select"
                  >
                    <option value="name">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                    <option value="date">Newest</option>
                    <option value="date-desc">Oldest</option>
                  </select>
                </div>
              </div>
            </div>

            {renderInfiniteGrid(false)}
          </section>
        )}
        {activeTab === 'myScenes' && (
          <section className="content-section">
            <div className="section-header">
              <div className="section-title-group">
                <h2 className="section-title">Your Scenes</h2>
                <p className="section-description">Your personal collection of physics simulations.</p>
              </div>

              <div className="collection-controls">
                <div className="search-container">
                  <FontAwesomeIcon icon={faSearch} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search your scenes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>

                <div className="sort-container">
                  <FontAwesomeIcon icon={faSort} className="sort-icon" />
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="sort-select"
                  >
                    <option value="name">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                    <option value="date">Newest</option>
                    <option value="date-desc">Oldest</option>
                  </select>
                </div>
              </div>
            </div>

            {renderInfiniteGrid(true)}
          </section>
        )}
      </main>
    </div>
  );
}

export default CollectionView;
