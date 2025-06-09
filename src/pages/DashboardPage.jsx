// src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import logoFull from '../assets/physicsvisualizer.svg';
import { faPlus, faClockRotateLeft, faFolderOpen, faCompass, faUserCircle, faSignInAlt, faSignOutAlt, faArrowRight } from '@fortawesome/free-solid-svg-icons';

import './dashboard.css'; // Assuming your CSS file

import { useAuth } from '../contexts/AuthContext';
import { useDatabase } from '../contexts/DatabaseContext';

function DashboardPage() {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading, googleSignIn, logout } = useAuth();
  const { queryUserCollection, queryPublicCollection } = useDatabase(); // Destructure both functions

  const [yourScenes, setYourScenes] = useState([]);
  const [recentScenes, setRecentScenes] = useState([]); // This is still a placeholder for future feature
  const [publicScenes, setPublicScenes] = useState([]);

  const [loadingYourScenes, setLoadingYourScenes] = useState(true);
  const [loadingPublicScenes, setLoadingPublicScenes] = useState(true);

  const [error, setError] = useState(null);

  // Effect to fetch public scenes (runs once on mount)
  useEffect(() => {
    const getPublicScenes = async () => {
      setLoadingPublicScenes(true);
      setError(null);
      try {
        // Use queryPublicCollection, limit to 3 for dashboard preview
        const scenes = await queryPublicCollection('public_scenes', [], 3);
        setPublicScenes(scenes);
      } catch (err) {
        console.error("Error fetching public scenes:", err);
        setError("Failed to load public scenes. Please try again.");
      } finally {
        setLoadingPublicScenes(false);
      }
    };
    getPublicScenes();
  }, [queryPublicCollection]); // Depend on queryPublicCollection (from useCallback)

  // Effect to fetch user-specific scenes (runs when auth state changes)
  useEffect(() => {
    const getUserScenes = async () => {
      if (!authLoading) { // Only proceed once auth state is determined
        if (currentUser) {
          setLoadingYourScenes(true);
          setError(null);
          try {
            // Use queryUserCollection for user's scenes
            const scenes = await queryUserCollection('scenes', [
              { field: 'authorId', operator: '==', value: currentUser.uid }
            ], {field: 'createdAt', direction: 'desc'}, 5); // Example: order by creation date, limit 5
            const formattedScenes = scenes.map(scene => ({
              ...scene,
              created: scene.createdAt?.toDate().toLocaleDateString() || 'N/A'
            }));
            setYourScenes(formattedScenes);
          } catch (err) {
            console.error("Error fetching user scenes:", err);
            setError("Failed to load your scenes. Please try again.");
          } finally {
            setLoadingYourScenes(false);
          }
        } else {
          // No user logged in, clear user scenes and loading state
          setYourScenes([]);
          setLoadingYourScenes(false);
          setRecentScenes([]); // Still a placeholder
        }
      }
    };
    getUserScenes();
  }, [currentUser, authLoading, queryUserCollection]); // Depend on currentUser, authLoading, queryUserCollection

  const handleCreateNewScene = () => {
    if (!currentUser) {
      alert("Please sign in to create a new scene.");
      return;
    }
    navigate('/visualizer', { state: { sceneToLoad: 'new_empty_scene' } });
  };

  const handleExploreCollection = () => {
    navigate('/collection');
  };

  const handleViewAllYourScenes = () => {
    if (!currentUser) {
        alert("Please sign in to view your saved scenes in the collection.");
        return;
    }
    navigate('/collection', { state: { activeTab: 'myScenes' } });
  };

  const handleSignInOut = async () => {
    if (currentUser) {
      try {
        await logout();
        alert("You have been signed out.");
      } catch (error) {
        console.error("Error signing out:", error);
        alert("Failed to sign out. Please try again.");
      }
    } else {
      try {
        await googleSignIn();
      } catch (error) {
        if (error.code !== 'auth/popup-closed-by-user') {
          alert("Failed to sign in. Please try again: " + error.message);
        }
      }
    }
  };

  const handleSceneClick = (sceneId) => {
    navigate('/visualizer', { state: { sceneToLoad: sceneId } });
  };

  const handlePublicSceneClick = (sceneId) => {
    navigate('/visualizer', { state: { sceneToLoad: sceneId, isPublic: true } });
  };

  // Render a full page loading spinner if auth state is still loading
  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px', color: '#fff' }}>
        Loading Physics Visualizer Dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logoFull} alt="Physics Visualizer Logo" height="45px" />
          <span className="dashboard-title-text">Dashboard</span>
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

      <main className="dashboard-content">
        {/* Left Column: Create New Scene & Recent Scenes */}
        <div className="dashboard-column-left">
          <section className="dashboard-card create-scene-card" onClick={handleCreateNewScene}>
            <FontAwesomeIcon icon={faPlus} className="card-icon-large" />
            <h3>Create New Scene</h3>
            <p>Start with a blank canvas.</p>
            {!currentUser && <small style={{ marginTop: '10px', color: '#ffcc00' }}>(Sign in required)</small>}
          </section>

          <section className="dashboard-card recent-scenes-card">
            <div className="card-header">
              <div className="card-title">
              <FontAwesomeIcon icon={faClockRotateLeft} className="card-icon" />
              <h3>Recent Scenes</h3>
              </div>
            </div>
            <div className="scene-list">
              {recentScenes.length > 0 ? (
                <ul>
                  {recentScenes.map(scene => (
                    <li key={scene.id} onClick={() => handleSceneClick(scene.id)}>
                      <strong>{scene.name || scene.title}</strong> <small>(Accessed: {scene.lastAccessed || 'N/A'})</small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-scenes-message">No recent scenes available. <br/>(Future feature for tracking your accessed scenes!)</p>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Your Scenes & Explore Public Scenes */}
        <div className="dashboard-column-right">
          <section className="dashboard-card your-scenes-card">
            <div className="card-header">
              <div className="card-title">
              <FontAwesomeIcon icon={faFolderOpen} className="card-icon" />
              <h3>Your Scenes</h3>
              </div>

              <button className="view-all-button" onClick={handleViewAllYourScenes} disabled={!currentUser}>
                View All <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
            <div className="scene-list">
              {loadingYourScenes && currentUser ? (
                <p className="loading-message">Loading your scenes...</p>
              ) : currentUser ? (
                yourScenes.length > 0 ? (
                  <ul>
                    {yourScenes.slice(0, 5).map(scene => (
                      <li key={scene.id} onClick={() => handleSceneClick(scene.id)}>
                        <strong>{scene.name || scene.title}</strong> <small>(Created: {scene.created})</small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-scenes-message">You haven't created any scenes yet.</p>
                )
              ) : (
                <p className="no-scenes-message">Sign in to see your saved scenes.</p>
              )}
            </div>
          </section>

          <div className="horizontal-partition"></div>

          <section className="dashboard-card explore-collection-card">
            <div className="card-header" style={{ justifyContent: 'space-between' }}>
              <div className='card-title' style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FontAwesomeIcon icon={faCompass} className="card-icon" />
                <h3>Explore Public Scenes</h3>
              </div>
              <button className="view-all-button" onClick={handleExploreCollection}>
                View All <FontAwesomeIcon icon={faArrowRight}/>
              </button>
            </div>
            <p className="explore-description">Browse predefined example scenes.</p>

            <div className="scene-list">
              {loadingPublicScenes ? (
                <p className="loading-message">Loading public scenes...</p>
              ) : publicScenes.length > 0 ? (
                <ul>
                  {publicScenes.map(scene => (
                    <li key={scene.id} onClick={() => handlePublicSceneClick(scene.id)}>
                      <strong>{scene.title}</strong>
                      {scene.description && <small>{scene.description}</small>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-scenes-message">No public scenes available yet.</p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;