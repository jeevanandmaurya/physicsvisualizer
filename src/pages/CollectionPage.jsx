import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faSignInAlt, faSignOutAlt, faSpinner } from '@fortawesome/free-solid-svg-icons';
import logoFull from '../assets/physicsvisualizer.svg';
import './collection.css';

import { useAuth } from '../contexts/AuthContext';
import { useDatabase } from '../contexts/DatabaseContext'; // Use our DataManager

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

function SceneCard({ scene, isPublic = false }) {
  // Use scene.name as it's more consistent across the app
  const sceneName = scene.name || scene.title || 'Untitled Scene';
  
  return (
    <div className="scene-card">
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
              Updated: {scene.updatedAt.toDate().toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
      <div className="scene-actions">
        <Link to="/visualizer" state={{ sceneToLoad: scene.id, isPublic }} className="scene-action-button">
          View Scene
        </Link>
      </div>
    </div>
  );
}

// --- Main CollectionPage Component ---

function CollectionPage() {
  const location = useLocation();
  const { currentUser, loading: authLoading, googleSignIn, logout } = useAuth();
  const dataManager = useDatabase(); // Get the entire DataManager

  const [publicScenes, setPublicScenes] = useState([]);
  const [userScenes, setUserScenes] = useState([]);
  const [loadingPublic, setLoadingPublic] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'publicScenes');

  // --- MODIFIED: Effect to fetch public scenes using DataManager ---
  useEffect(() => {
    let isMounted = true;
    if (!dataManager) return;

    setLoadingPublic(true);
    setError(null);
    dataManager.getScenes('public')
      .then(scenes => {
        if (isMounted) setPublicScenes(scenes);
      })
      .catch(err => {
        console.error("Error fetching public scenes:", err);
        if (isMounted) setError("Failed to load public scenes.");
      })
      .finally(() => {
        if (isMounted) setLoadingPublic(false);
      });
      
    return () => { isMounted = false; };
  }, [dataManager]);

  // --- MODIFIED: Effect to fetch user scenes using DataManager ---
  useEffect(() => {
    let isMounted = true;
    if (!dataManager || authLoading) return;

    if (currentUser) {
      setLoadingUser(true);
      setError(null);
      dataManager.getScenes('user', { orderBy: { field: 'updatedAt', direction: 'desc' } })
        .then(scenes => {
          if (isMounted) setUserScenes(scenes);
        })
        .catch(err => {
          console.error("Error fetching user scenes:", err);
          if (isMounted) setError("Failed to load your scenes.");
        })
        .finally(() => {
          if (isMounted) setLoadingUser(false);
        });
    } else {
      setUserScenes([]);
      setLoadingUser(false);
    }
    
    return () => { isMounted = false; };
  }, [currentUser, authLoading, dataManager]);
  
  const handleSignInOut = useCallback(async () => {
    if (currentUser) {
      await logout();
    } else {
      await googleSignIn().catch(err => {
        if (err.code !== 'auth/popup-closed-by-user') console.error(err);
      });
    }
  }, [currentUser, logout, googleSignIn]);

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
        {scenes.map(scene => <SceneCard key={scene.id} scene={scene} isPublic={!isUserTab} />)}
      </div>
    );
  };

  return (
    <div className="collection-page-container">
      <header className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link to="/"><img src={logoFull} alt="Physics Visualizer Logo" height="45px" /></Link>
          <span className="dashboard-title-text">Explore Scenes</span>
        </div>
        <div className="user-section">
          {authLoading ? (
            <div className="user-info loading"><FontAwesomeIcon icon={faSpinner} spin /></div>
          ) : currentUser ? (
            <div className="user-info" onClick={handleSignInOut} title="Click to Sign Out">
              <img src={currentUser.photoURL} alt={currentUser.displayName} className="user-avatar" />
              <span>{currentUser.displayName}</span>
            </div>
          ) : (
            <button className="sign-in-button" onClick={handleSignInOut}>
              <FontAwesomeIcon icon={faSignInAlt} /> Sign In
            </button>
          )}
        </div>
      </header>
      
      <nav className="collection-page-nav-tabs">
        <button className={`tab-button ${activeTab === 'publicScenes' ? 'active-tab' : ''}`} onClick={() => setActiveTab('publicScenes')}>
          Public Scenes
        </button>
        <button className={`tab-button ${activeTab === 'myScenes' ? 'active-tab' : ''}`} onClick={() => setActiveTab('myScenes')} disabled={!currentUser && !authLoading}>
          Your Scenes {(!currentUser && !authLoading) && '(Sign in required)'}
        </button>
      </nav>

      <main className="collection-page-main-content">
        {activeTab === 'publicScenes' && (
          <section className="content-section">
            <h2 className="section-title">Public Scenes</h2>
            <p className="section-description">Explore simulations created by educators and the community.</p>
            {renderSceneGrid(publicScenes, loadingPublic)}
          </section>
        )}
        {activeTab === 'myScenes' && (
          <section className="content-section">
            <h2 className="section-title">Your Scenes</h2>
            <p className="section-description">Your personal collection of physics simulations.</p>
            {currentUser ?
              renderSceneGrid(userScenes, loadingUser, true) :
              <p className="empty-state-message">Please sign in to view your personal collection. ✨</p>
            }
          </section>
        )}
      </main>
    </div>
  );
}

export default CollectionPage;