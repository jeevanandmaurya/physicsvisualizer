import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faSignInAlt, faSignOutAlt, faSpinner } from '@fortawesome/free-solid-svg-icons';
import '../pages/collection.css';

import { useDatabase } from '../contexts/DatabaseContext';
import { useWorkspace, useWorkspaceScene } from '../contexts/WorkspaceContext';

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
  // Use scene.name as it's more consistent across the app
  const sceneName = scene.name || scene.title || 'Untitled Scene';

  const handleSceneClick = () => {
    onSceneClick(scene.id, isPublic);
  };

  return (
    <div className="scene-card" onClick={handleSceneClick} style={{ cursor: 'pointer' }}>
      <img
        src={scene.thumbnailUrl || 'https://placehold.co/350x180/2c2c2c/ffffff?text=Scene'}
        alt={sceneName}
        className="scene-thumbnail"
      />
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

  // --- MODIFIED: Effect to fetch example scenes using DataManager ---
  useEffect(() => {
    let isMounted = true;
    if (!dataManager) return;

    setLoadingPublic(true);
    setError(null);
    dataManager.getScenes('examples')
      .then(scenes => {
        if (isMounted) setPublicScenes(scenes);
      })
      .catch(err => {
        console.error("Error fetching example scenes:", err);
        if (isMounted) setError("Failed to load example scenes.");
      })
      .finally(() => {
        if (isMounted) setLoadingPublic(false);
      });

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

  const handleSceneClick = useCallback(async (sceneId, isPublic) => {
    try {
      console.log('🎯 Loading scene:', sceneId, 'isPublic:', isPublic);

      // Find the scene in the appropriate array
      const scenesArray = isPublic ? publicScenes : userScenes;
      const scene = scenesArray.find(s => s.id === sceneId);

      if (!scene) {
        console.error('❌ Scene not found:', sceneId);
        return;
      }

      console.log('✅ Found scene:', scene.name);

      // Load scene into workspace
      updateScene(scene);

      // Switch to visualizer view
      setCurrentView('visualizer');

      console.log('🚀 Scene loaded and view switched to visualizer');
    } catch (error) {
      console.error('❌ Error loading scene:', error);
    }
  }, [setCurrentView, updateScene, publicScenes, userScenes]);

  // Renders the scene grid with appropriate loading, empty, and error states
  const renderSceneGrid = (scenes, isLoading, isUserTab = false) => {
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

    if (scenes.length === 0) {
      if (isUserTab) {
        return <p className="empty-state-message">You haven't created any scenes yet. Go create one! 🚀</p>;
      }
      return <p className="empty-state-message">No public scenes are available at the moment. 🌌</p>;
    }

    return (
      <div className="scene-grid">
        {scenes.map(scene => <SceneCard key={scene.id} scene={scene} isPublic={!isUserTab} onSceneClick={handleSceneClick} />)}
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
            <h2 className="section-title">Example Scenes</h2>
            <p className="section-description">Explore simulations created by educators and the community.</p>
            {renderSceneGrid(publicScenes, loadingPublic)}
          </section>
        )}
        {activeTab === 'myScenes' && (
          <section className="content-section">
            <h2 className="section-title">Your Scenes</h2>
            <p className="section-description">Your personal collection of physics simulations.</p>
            {renderSceneGrid(userScenes, loadingUser, true)}
          </section>
        )}
      </main>
    </div>
  );
}

export default CollectionView;
