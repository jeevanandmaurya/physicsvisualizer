import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import logoFull from '../assets/physicsvisualizer.svg';
import { faPlus, faClockRotateLeft, faFolderOpen, faCompass, faArrowRight, faSpinner } from '@fortawesome/free-solid-svg-icons';

import './dashboard.css';

import { useDatabase } from '../contexts/DatabaseContext'; // Use our DataManager

function DashboardPage() {
    const navigate = useNavigate();
    const dataManager = useDatabase();

    // --- State Management ---
    const [yourScenes, setYourScenes] = useState([]);
    const [exampleScenes, setExampleScenes] = useState([]);
    // NEW: State for recently viewed scenes
    const [recentScenes, setRecentScenes] = useState([]);

    const [loadingYourScenes, setLoadingYourScenes] = useState(false);
    const [loadingExampleScenes, setLoadingExampleScenes] = useState(false);
    const [error, setError] = useState(null);

    // --- EFFECT: Fetches all dashboard data ---
    useEffect(() => {
        if (!dataManager) return;
        let isMounted = true;

        // 1. Fetch Recently Viewed scenes from localStorage (synchronous)
        setRecentScenes(dataManager.getRecentScenes());

        // 2. Fetch Example Scenes
        setLoadingExampleScenes(true);
        dataManager.getScenes('examples', { limitTo: 3 })
            .then(scenes => { if (isMounted) setExampleScenes(scenes); })
            .catch(err => {
                console.error("Error fetching example scenes:", err);
                if (isMounted) setError("Failed to load example scenes.");
            })
            .finally(() => { if (isMounted) setLoadingExampleScenes(false); });

        // 3. Fetch User's Scenes from Local Storage
        setLoadingYourScenes(true);
        const options = { limitTo: 5, orderBy: { field: 'updatedAt', direction: 'desc' } };
        dataManager.getScenes('user', options)
            .then(scenes => { if (isMounted) setYourScenes(scenes); })
            .catch(err => {
                console.error("Error fetching user scenes:", err);
                if (isMounted) setError("Failed to load your scenes.");
            })
            .finally(() => { if (isMounted) setLoadingYourScenes(false); });

        return () => { isMounted = false; };
    }, [dataManager]);


    // --- Memoized Handlers and UI Components (No changes needed below) ---

    const handleCreateNewScene = useCallback(() => {
        navigate('/visualizer', { state: { sceneToLoad: 'new_empty_scene' } });
    }, [navigate]);

    const handleNavigateToScene = useCallback((sceneId, isPublic = false) => {
        navigate('/visualizer', { state: { sceneToLoad: sceneId, isPublic } });
    }, [navigate]);

    const handleExploreCollection = useCallback(() => navigate('/collection'), [navigate]);
    
    const handleViewAllYourScenes = useCallback(() => {
        navigate('/collection', { state: { activeTab: 'myScenes' } });
    }, [navigate]);

    const YourScenesContent = useMemo(() => {
        if (loadingYourScenes) { return <div className="scene-list-loading"><FontAwesomeIcon icon={faSpinner} spin /></div>; }
        if (yourScenes.length > 0) {
            return (
                <ul>
                    {yourScenes.map(scene => (
                        <li key={scene.id} onClick={() => handleNavigateToScene(scene.id)}>
                            <strong>{scene.name || 'Untitled Scene'}</strong>
                            <small>(Updated: {new Date(scene.updatedAt).toLocaleDateString() || 'N/A'})</small>
                        </li>
                    ))}
                </ul>
            );
        }
        return <p className="no-scenes-message">You haven't created any scenes yet.</p>;
    }, [loadingYourScenes, yourScenes, handleNavigateToScene]);

    return (
        <div className="dashboard-container">
            <main className="dashboard-content">
                <div className="dashboard-column-left">
                    <section className="dashboard-card create-scene-card" onClick={handleCreateNewScene}>
                        <FontAwesomeIcon icon={faPlus} className="card-icon-large" />
                        <h3>Create New Scene</h3>
                        <p>Start with a blank canvas.</p>
                    </section>

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
                            <button className="view-all-button" onClick={handleViewAllYourScenes}>
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
                                <h3>Explore Examples</h3>
                            </div>
                            <button className="view-all-button" onClick={handleExploreCollection}>
                                View All <FontAwesomeIcon icon={faArrowRight}/>
                            </button>
                        </div>
                        <div className="scene-list">
                            {loadingExampleScenes ? (
                                <div className="scene-list-loading"><FontAwesomeIcon icon={faSpinner} spin /></div>
                            ) : exampleScenes.length > 0 ? (
                                <ul>
                                    {exampleScenes.map(scene => (
                                        <li key={scene.id} onClick={() => handleNavigateToScene(scene.id, false)}>
                                            <strong>{scene.name || 'Untitled Scene'}</strong>
                                            {scene.description && <small>{scene.description}</small>}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="no-scenes-message">No example scenes available.</p>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default DashboardPage;
