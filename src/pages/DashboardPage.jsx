import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import logoFull from '../assets/physicsvisualizer.svg';
import { faPlus, faClockRotateLeft, faFolderOpen, faCompass, faUserCircle, faSignInAlt, faSignOutAlt, faArrowRight, faSpinner } from '@fortawesome/free-solid-svg-icons';

import './dashboard.css';

import { useAuth } from '../contexts/AuthContext';
import { useDatabase } from '../contexts/DatabaseContext'; // Use our DataManager

function DashboardPage() {
    const navigate = useNavigate();
    const { currentUser, loading: authLoading, googleSignIn, logout } = useAuth();
    const dataManager = useDatabase();

    // --- State Management ---
    const [yourScenes, setYourScenes] = useState([]);
    const [publicScenes, setPublicScenes] = useState([]);
    // NEW: State for recently viewed scenes
    const [recentScenes, setRecentScenes] = useState([]);

    const [loadingYourScenes, setLoadingYourScenes] = useState(false);
    const [loadingPublicScenes, setLoadingPublicScenes] = useState(false);
    const [error, setError] = useState(null);

    // --- EFFECT: Fetches all dashboard data ---
    useEffect(() => {
        if (!dataManager) return;
        let isMounted = true;

        // 1. Fetch Recently Viewed scenes from localStorage (synchronous)
        setRecentScenes(dataManager.getRecentScenes());

        // 2. Fetch Public Scenes from Firestore
        setLoadingPublicScenes(true);
        dataManager.getScenes('public', { limitTo: 3 })
            .then(scenes => { if (isMounted) setPublicScenes(scenes); })
            .catch(err => {
                console.error("Error fetching public scenes:", err);
                if (isMounted) setError("Failed to load public scenes.");
            })
            .finally(() => { if (isMounted) setLoadingPublicScenes(false); });

        // 3. Fetch User's Scenes from Firestore (if logged in)
        if (currentUser && !authLoading) {
            setLoadingYourScenes(true);
            const options = { limitTo: 5, orderBy: { field: 'updatedAt', direction: 'desc' } };
            dataManager.getScenes('user', options)
                .then(scenes => { if (isMounted) setYourScenes(scenes); })
                .catch(err => {
                    console.error("Error fetching user scenes:", err);
                    if (isMounted) setError("Failed to load your scenes.");
                })
                .finally(() => { if (isMounted) setLoadingYourScenes(false); });
        } else if (!currentUser) {
            setYourScenes([]); // Clear scenes on logout
        }

        return () => { isMounted = false; };
    }, [currentUser, authLoading, dataManager]);


    // --- Memoized Handlers and UI Components (No changes needed below) ---

    const handleCreateNewScene = useCallback(() => {
        if (!currentUser) { alert("Please sign in to create a new scene."); return; }
        navigate('/visualizer', { state: { sceneToLoad: 'new_empty_scene' } });
    }, [currentUser, navigate]);

    const handleNavigateToScene = useCallback((sceneId, isPublic = false) => {
        navigate('/visualizer', { state: { sceneToLoad: sceneId, isPublic } });
    }, [navigate]);

    const handleExploreCollection = useCallback(() => navigate('/collection'), [navigate]);
    
    const handleViewAllYourScenes = useCallback(() => {
        if (!currentUser) { alert("Please sign in to view your collection."); return; }
        navigate('/collection', { state: { activeTab: 'myScenes' } });
    }, [currentUser, navigate]);

    const handleSignInOut = useCallback(async () => {
        if (currentUser) await logout();
        else await googleSignIn().catch(err => { if (err.code !== 'auth/popup-closed-by-user') console.error(err); });
    }, [currentUser, logout, googleSignIn]);

    const UserProfile = useMemo(() => {
        if (authLoading) { return <div className="user-info loading"><FontAwesomeIcon icon={faSpinner} spin /></div>; }
        if (currentUser) {
            return (
                <div className="user-info" onClick={handleSignInOut} title="Click to Sign Out">
                    <img src={currentUser.photoURL} alt={currentUser.displayName} className="user-avatar" />
                    <span>{currentUser.displayName}</span>
                    <span className="sign-out-link"><FontAwesomeIcon icon={faSignOutAlt} /></span>
                </div>
            );
        }
        return <button className="sign-in-button" onClick={handleSignInOut}><FontAwesomeIcon icon={faSignInAlt} /> Sign In</button>;
    }, [authLoading, currentUser, handleSignInOut]);

    const YourScenesContent = useMemo(() => {
        if (loadingYourScenes || authLoading) { return <div className="scene-list-loading"><FontAwesomeIcon icon={faSpinner} spin /></div>; }
        if (!currentUser) { return <p className="no-scenes-message">Sign in to see your scenes.</p>; }
        if (yourScenes.length > 0) {
            return (
                <ul>
                    {yourScenes.map(scene => (
                        <li key={scene.id} onClick={() => handleNavigateToScene(scene.id)}>
                            <strong>{scene.name || 'Untitled Scene'}</strong>
                            <small>(Updated: {scene.updatedAt?.toDate().toLocaleDateString() || 'N/A'})</small>
                        </li>
                    ))}
                </ul>
            );
        }
        return <p className="no-scenes-message">You haven't created any scenes yet.</p>;
    }, [authLoading, currentUser, loadingYourScenes, yourScenes, handleNavigateToScene]);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <img src={logoFull} alt="Physics Visualizer Logo" height="45px" />
                    <span className="dashboard-title-text">Dashboard</span>
                </div>
                <div className="user-section">{UserProfile}</div>
            </header>

            <main className="dashboard-content">
                <div className="dashboard-column-left">
                    <section className="dashboard-card create-scene-card" onClick={handleCreateNewScene}>
                        <FontAwesomeIcon icon={faPlus} className="card-icon-large" />
                        <h3>Create New Scene</h3>
                        <p>Start with a blank canvas.</p>
                        {!currentUser && !authLoading && <small className="signin-required">(Sign in required)</small>}
                    </section>

                    {/* --- RESTORED: Recently Viewed Scenes Card --- */}
                    <section className="dashboard-card recent-scenes-card">
                        <div className="card-header">
                            <div className="card-title">
                                <FontAwesomeIcon icon={faClockRotateLeft} className="card-icon" />
                                <h3>Recently Viewed</h3>
                            </div>
                        </div>
                        <div className="scene-list">
                            {recentScenes.length > 0 ? (
                                <ul>
                                    {recentScenes.map(scene => (
                                        <li key={scene.id} onClick={() => handleNavigateToScene(scene.id, scene.isPublic)}>
                                            <strong>{scene.name || 'Untitled Scene'}</strong>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="no-scenes-message">Scenes you view will appear here.</p>
                            )}
                        </div>
                    </section>
                </div>

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
                        <div className="scene-list">{YourScenesContent}</div>
                    </section>

                    <div className="horizontal-partition"></div>

                    <section className="dashboard-card explore-collection-card">
                        <div className="card-header">
                             <div className="card-title">
                                <FontAwesomeIcon icon={faCompass} className="card-icon" />
                                <h3>Explore Public Scenes</h3>
                            </div>
                            <button className="view-all-button" onClick={handleExploreCollection}>
                                View All <FontAwesomeIcon icon={faArrowRight}/>
                            </button>
                        </div>
                        <div className="scene-list">
                            {loadingPublicScenes ? (
                                <div className="scene-list-loading"><FontAwesomeIcon icon={faSpinner} spin /></div>
                            ) : publicScenes.length > 0 ? (
                                <ul>
                                    {publicScenes.map(scene => (
                                        <li key={scene.id} onClick={() => handleNavigateToScene(scene.id, true)}>
                                            <strong>{scene.name || 'Untitled Scene'}</strong>
                                            {scene.description && <small>{scene.description}</small>}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="no-scenes-message">No public scenes available.</p>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default DashboardPage;