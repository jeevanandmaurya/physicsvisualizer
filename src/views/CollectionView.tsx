import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faSignInAlt, faSignOutAlt, faSpinner, faSearch, faSort, faSortAlphaDown, faSortAlphaUp, faCalendarAlt, faCalendar } from '@fortawesome/free-solid-svg-icons';

import { useDatabase } from '../contexts/DatabaseContext';
import { useWorkspace, useWorkspaceScene } from '../contexts/WorkspaceContext';
import './CollectionView.css';

// --- Reusable UI Components ---

function SceneSkeleton() {
  return (
    <div className="scene-card skeleton">
      <div className="scene-thumbnail skeleton-shimmer" />
      <div className="scene-card-content">
        <div className="skeleton-title skeleton-shimmer" />
        <div className="skeleton-description">
          <div className="skeleton-line skeleton-shimmer" />
          <div className="skeleton-line skeleton-shimmer" />
        </div>
      </div>
      <div className="scene-actions"><div className="skeleton-button skeleton-shimmer" /></div>
    </div>
  );
}

function SceneCard({ scene, isPublic = false, onSceneClick }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Use scene.name as it's more consistent across the app
  const sceneName = scene.name || scene.title || 'Untitled Scene';

  const handleSceneClick = () => {
    onSceneClick(scene.id, isPublic);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true); // Show placeholder if image fails
  };

  return (
    <div className="scene-card" onClick={handleSceneClick} style={{ cursor: 'pointer' }}>
      <div className="scene-thumbnail-container" style={{ position: 'relative' }}>
        {!imageLoaded && (
          <div className="scene-thumbnail skeleton-shimmer" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1
          }} />
        )}
        <img
          src={imageError ? 'https://placehold.co/200/2c2c2c/ffffff?text=Scene' : (scene.thumbnailUrl || 'https://placehold.co/200/2c2c2c/ffffff?text=Scene')}
          alt={sceneName}
          className="scene-thumbnail"
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ 
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
        />
      </div>
      <div className="scene-card-content">
        <h3 className="scene-title" title={sceneName}>{sceneName}</h3>
        <p className="scene-description">{scene.description || 'No description available.'}</p>
        {!isPublic && scene.updatedAt && (
          <div className="scene-meta">
            <span className="scene-meta-item">
              Updated: {new Date(scene.updatedAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
      <div className="scene-actions">
        <button className="scene-action-button">
          View Scene
        </button>
      </div>
    </div>
  );
}

// --- Main CollectionView Component ---

function CollectionView() {
  const { setCurrentView } = useWorkspace();
  const { updateScene } = useWorkspaceScene();
  const dataManager = useDatabase();

  const [publicScenes, setPublicScenes] = useState([]);
  const [userScenes, setUserScenes] = useState([]);
  const [loadingPublic, setLoadingPublic] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('publicScenes');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'date', 'name-desc', 'date-desc'

  // --- Effect to fetch example scenes and load thumbnails when collection view opens ---
  useEffect(() => {
    let isMounted = true;
    if (!dataManager) return;

    setLoadingPublic(true);
    setError(null);
    
    const loadScenesAndThumbnails = async () => {
      try {
        // Get scenes (JSON only, no thumbnails yet)
        const scenes = await dataManager.getScenes('examples');
        
        if (isMounted) {
          // Transform scenes into chat-like objects for display
          const exampleChats = scenes.map(scene => ({
            id: `chat-${scene.id}`,
            name: scene.name,
            description: scene.description,
            thumbnailUrl: scene.thumbnailUrl,
            sceneId: scene.id,
            isExample: true
          }));
          setPublicScenes(exampleChats);
        }

        // Now load thumbnails in the background (they'll update when ready)
        // Import SceneLoader to load thumbnails
        const { SceneLoader } = await import('../core/scene/SceneLoader');
        await SceneLoader.loadAllThumbnails();
        
        // Refresh scenes with thumbnails
        if (isMounted) {
          const scenesWithThumbnails = await dataManager.getScenes('examples');
          const updatedChats = scenesWithThumbnails.map(scene => ({
            id: `chat-${scene.id}`,
            name: scene.name,
            description: scene.description,
            thumbnailUrl: scene.thumbnailUrl,
            sceneId: scene.id,
            isExample: true
          }));
          setPublicScenes(updatedChats);
        }
      } catch (err) {
        console.error("Error fetching example scenes:", err);
        if (isMounted) setError("Failed to load example scenes.");
      } finally {
        if (isMounted) setLoadingPublic(false);
      }
    };

    loadScenesAndThumbnails();

    return () => { isMounted = false; };
  }, [dataManager]);

  // --- MODIFIED: Effect to fetch user scenes using DataManager ---
  useEffect(() => {
    let isMounted = true;
    if (!dataManager) return;

    const fetchUserScenes = async () => {
      setLoadingUser(true);
      setError(null);
      try {
        const scenes = await dataManager.getScenes('user', { orderBy: { field: 'updatedAt', direction: 'desc' } });
        if (isMounted) {
          setUserScenes(scenes);
          console.log('📚 Fetched user scenes:', scenes.length);
          scenes.forEach(scene => {
            if (scene.thumbnailUrl) {
              console.log(`🖼️ Scene "${scene.name}" has thumbnail:`, scene.thumbnailUrl.substring(0, 50) + '...');
            }
          });
        }
      } catch (err) {
        console.error("Error fetching user scenes:", err);
        if (isMounted) setError("Failed to load your scenes.");
      } finally {
        if (isMounted) setLoadingUser(false);
      }
    };

    fetchUserScenes();

    return () => { isMounted = false; };
  }, [dataManager]);

  const handleSceneClick = useCallback(async (chatId, isPublic) => {
    try {
      console.log('🎯 Loading chat/scene:', chatId, 'isPublic:', isPublic);

      // Find the chat/scene in the appropriate array
      const scenesArray = isPublic ? publicScenes : userScenes;
      const chatItem = scenesArray.find(s => s.id === chatId);

      if (!chatItem) {
        console.error('❌ Chat/scene not found:', chatId);
        return;
      }

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
  }, [setCurrentView, updateScene, publicScenes, userScenes, dataManager]);

  // Filter and sort scenes based on search term and sort option
  const filteredAndSortedScenes = useMemo(() => {
    const scenes = activeTab === 'publicScenes' ? publicScenes : userScenes;

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
  }, [activeTab, publicScenes, userScenes, searchTerm, sortBy]);

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };

  // Renders the scene grid with appropriate loading, empty, and error states
  const renderSceneGrid = (isLoading, isUserTab = false) => {
    if (isLoading) {
      return (
        <div className="scene-grid">
          {Array.from({ length: 6 }).map((_, i) => <SceneSkeleton key={i} />)}
        </div>
      );
    }

    if (error && activeTab === (isUserTab ? 'myScenes' : 'publicScenes')) {
        return <p className="error-state-message">{error}</p>;
    }

    if (filteredAndSortedScenes.length === 0) {
      if (searchTerm) {
        return <p className="empty-state-message">No scenes match your search. Try different keywords.</p>;
      }
      if (isUserTab) {
        return <p className="empty-state-message">You haven't created any scenes yet. Go create one! 🚀</p>;
      }
      return <p className="empty-state-message">No public scenes are available at the moment. 🌌</p>;
    }

    return (
      <div className="scene-grid">
        {filteredAndSortedScenes.map(scene => <SceneCard key={scene.id} scene={scene} isPublic={!isUserTab} onSceneClick={handleSceneClick} />)}
      </div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <h2 className="section-title">Example Scenes</h2>
                <p className="section-description">Explore simulations created by educators and the community.</p>
              </div>

              {/* Search and Sort Controls - Top Right */}
              <div className="collection-controls" style={{
                display: 'flex',
                gap: '20px',
                alignItems: 'center',
                flexWrap: 'wrap',
                marginLeft: '20px'
              }}>
                <div className="search-container" style={{
                  position: 'relative',
                  minWidth: '150px',
                  width: '180px'
                }}>
                  <FontAwesomeIcon icon={faSearch} style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--border-color)',
                    fontSize: '12px'
                  }} />
                  <input
                    type="text"
                    placeholder="Search scenes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px 8px 30px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-color)',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div className="sort-container" style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <FontAwesomeIcon icon={faSort} style={{ color: 'var(--border-color)', fontSize: '12px' }} />
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    style={{
                      padding: '6px 8px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-color)',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="name">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                    <option value="date">Newest</option>
                    <option value="date-desc">Oldest</option>
                  </select>
                </div>
              </div>
            </div>

            {renderSceneGrid(loadingPublic)}
          </section>
        )}
        {activeTab === 'myScenes' && (
          <section className="content-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <h2 className="section-title">Your Scenes</h2>
                <p className="section-description">Your personal collection of physics simulations.</p>
              </div>

              {/* Search and Sort Controls - Top Right */}
              <div className="collection-controls" style={{
                display: 'flex',
                gap: '20px',
                alignItems: 'center',
                flexWrap: 'wrap',
                marginLeft: '20px'
              }}>
                <div className="search-container" style={{
                  position: 'relative',
                  minWidth: '150px',
                  width: '180px'
                }}>
                  <FontAwesomeIcon icon={faSearch} style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--border-color)',
                    fontSize: '12px'
                  }} />
                  <input
                    type="text"
                    placeholder="Search your scenes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px 8px 30px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-color)',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div className="sort-container" style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <FontAwesomeIcon icon={faSort} style={{ color: 'var(--border-color)', fontSize: '12px' }} />
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    style={{
                      padding: '6px 8px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-color)',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="name">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                    <option value="date">Newest</option>
                    <option value="date-desc">Oldest</option>
                  </select>
                </div>
              </div>
            </div>

            {renderSceneGrid(loadingUser, true)}
          </section>
        )}
      </main>
    </div>
  );
}

export default CollectionView;
