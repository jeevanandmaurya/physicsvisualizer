// src/pages/CollectionPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faSignInAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import logoFull from '../assets/physicsvisualizer.svg';
import './collection.css';

// Import Firebase services
import { db, auth } from '../firebase-config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

// --- Reusable SceneCard Component ---
function SceneCard({ scene, isPublic = false }) {
  return (
    <div className="scene-card">
      <img 
        src={scene.thumbnailUrl || 'https://placehold.co/350x180/777777/FFFFFF?text=No+Thumbnail'} 
        alt={scene.title || scene.name} 
        className="scene-thumbnail" 
      />
      <div className="scene-card-content">
        <h3 className="scene-title" title={scene.title || scene.name}>
          {scene.title || scene.name || 'Untitled Scene'}
        </h3>
        <p className="scene-description">
          {scene.description || 'No description available.'}
        </p>
        {!isPublic && (
          <div className="scene-meta">
            <span className="scene-meta-item">
              Created: {scene.created || 'N/A'}
            </span>
          </div>
        )}
      </div>
      <div className="scene-actions">
        <Link 
          to={`/visualizer`} 
          state={{ sceneToLoad: scene.id, isPublic }} 
          className="scene-action-button"
        >
          View Scene
        </Link>
      </div>
    </div>
  );
}

// --- Main CollectionPage Component ---
function CollectionPage() {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [publicScenes, setPublicScenes] = useState([]);
  const [userScenes, setUserScenes] = useState([]);
  const [loadingPublic, setLoadingPublic] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState(null);

  // Set active tab based on navigation state or default to public scenes
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'publicScenes');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchPublicScenes();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchUserScenes(currentUser.uid);
    } else {
      setUserScenes([]);
      setLoadingUser(false);
    }
  }, [currentUser]);

  const fetchPublicScenes = async () => {
    setLoadingPublic(true);
    try {
      const q = query(collection(db, 'public_scenes'));
      const querySnapshot = await getDocs(q);
      const scenes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPublicScenes(scenes);
    } catch (err) {
      console.error("Error fetching public scenes:", err);
      setError("Failed to load public scenes. Please try again.");
    } finally {
      setLoadingPublic(false);
    }
  };

  const fetchUserScenes = async (uid) => {
    setLoadingUser(true);
    try {
      const q = query(
        collection(db, 'scenes'),
        where('authorId', '==', uid)
      );
      const querySnapshot = await getDocs(q);
      const scenes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created: doc.data().createdAt?.toDate().toLocaleDateString() || 'N/A'
      }));
      setUserScenes(scenes);
    } catch (err) {
      console.error("Error fetching user scenes:", err);
      setError("Failed to load your scenes. Please try again.");
    } finally {
      setLoadingUser(false);
    }
  };

  const handleSignInOut = async () => {
    if (currentUser) {
      try {
        await signOut(auth);
        alert("You have been signed out.");
      } catch (error) {
        console.error("Error signing out:", error);
        alert("Failed to sign out. Please try again.");
      }
    } else {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        if (error.code !== 'auth/popup-closed-by-user') {
          alert("Failed to sign in. Please try again: " + error.message);
        }
      }
    }
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    setError(null); // Clear any previous errors
  };

  // --- renderScenes function ---
  const renderScenes = (scenes, loading, isPublic) => {
    if (loading) {
      return <p className="empty-state-message">Loading scenes... ⏳</p>;
    }
    
    if (error) {
      return <p className="error-state-message">Error: {error}</p>;
    }
    
    if (!scenes || scenes.length === 0) {
      if (!isPublic && !currentUser) {
        return <p className="empty-state-message">Please log in to see your scenes. ✨</p>;
      }
      return (
        <p className="empty-state-message">
          {isPublic 
            ? "No public scenes available yet. 🌌" 
            : "You haven't created any scenes yet. Start creating! 🚀"
          }
        </p>
      );
    }
    
    return (
      <div className="scene-grid">
        {scenes.map(scene => (
          <SceneCard key={scene.id} scene={scene} isPublic={isPublic} />
        ))}
      </div>
    );
  };

  return (
    <div className="collection-page-container">
      <header className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logoFull} alt="Physics Visualizer Logo" height="45px" />
          <span className="dashboard-title-text">Explore</span>
        </div>
        <div className="user-section">
          {currentUser ? (
            <div className="user-info" onClick={handleSignInOut} title="Click to Sign Out">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt={currentUser.displayName || "User"} className="user-avatar" />
              ) : (
                <FontAwesomeIcon icon={faUserCircle} className="user-avatar-default" />
              )}
              <span>{currentUser.displayName || currentUser.email}</span>
              <span className="sign-out-link"><FontAwesomeIcon icon={faSignOutAlt} /> (Sign Out)</span>
            </div>
          ) : (
            <button className="sign-in-button" onClick={handleSignInOut}>
              <FontAwesomeIcon icon={faSignInAlt} /> Sign In
            </button>
          )}
        </div>
      </header>

      <div className="collection-navigation">
        <Link to="/" className="dashboard-link">← Back to Dashboard</Link>
      </div>

      <nav className="collection-page-nav-tabs">
        <button
          className={`tab-button ${activeTab === 'publicScenes' ? 'active-tab' : ''}`}
          onClick={() => handleTabClick('publicScenes')}
        >
          Public Scenes
        </button>
        <button
          className={`tab-button ${activeTab === 'myScenes' ? 'active-tab' : ''}`}
          onClick={() => handleTabClick('myScenes')}
          disabled={!currentUser}
        >
          Your Scenes {!currentUser && '(Sign in required)'}
        </button>
      </nav>

      <main className="collection-page-main-content">
        {activeTab === 'publicScenes' && (
          <section className="content-section">
            <h2 className="section-title">Public Scenes</h2>
            <p className="section-description">
              Explore example scenes and simulations created by educators and the community.
            </p>
            {renderScenes(publicScenes, loadingPublic, true)}
          </section>
        )}

        {activeTab === 'myScenes' && (
          <section className="content-section">
            <h2 className="section-title">Your Scenes</h2>
            <p className="section-description">
              Your personal collection of physics simulations and scenes.
            </p>
            {renderScenes(userScenes, loadingUser, false)}
          </section>
        )}
      </main>
    </div>
  );
}

export default CollectionPage;