import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFolderOpen, faCompass, faClockRotateLeft, faSpinner, faComments } from '@fortawesome/free-solid-svg-icons';

import logo from '../assets/physicsvisualizer.svg';

import { useDatabase, SceneData } from '../contexts/DatabaseContext';
import { useWorkspace, useWorkspaceScene } from '../contexts/WorkspaceContext';

function DashboardView() {
    const { setCurrentView } = useWorkspace();
    const { updateScene } = useWorkspaceScene();
    
    const dataManager = useDatabase();

    const [recentScenes, setRecentScenes] = useState<SceneData[]>([]);
    const [yourScenes, setYourScenes] = useState<SceneData[]>([]);
    const [exampleScenes, setExampleScenes] = useState<SceneData[]>([]);
    const [loading, setLoading] = useState(true);

    // Helper to generate a default new scene
    const createNewScene = useCallback(() => ({
        id: `new-${Date.now()}`,
        name: 'New Scene',
        description: 'A new physics simulation.',
        isTemporary: true, // Flag to indicate it's not saved yet
        gravity: [0, -9.81, 0],
        hasGround: true, // GroundPlane component handles ground rendering
        simulationScale: 'terrestrial',
        gravitationalPhysics: { enabled: false },
        objects: [] // No default ground box - GroundPlane handles ground
    }), []);

    useEffect(() => {
        if (!dataManager) return;

        const loadData = async () => {
            try {
                // Load recent scenes
                const recentScenesData = dataManager.getRecentScenes();
                setRecentScenes(recentScenesData || []);

                // Load user scenes
                const userScenesData = await dataManager.getScenes('user', {
                    limitTo: 3,
                    orderBy: { field: 'updatedAt', direction: 'desc' }
                });
                setYourScenes(userScenesData || []);

                // Load example scenes
                const exampleScenesData = await dataManager.getScenes('examples', { limitTo: 3 });
                setExampleScenes(exampleScenesData || []);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [dataManager]);

    const handleCreateNewScene = useCallback(async () => {
        if (!dataManager) return;
        const newScene = createNewScene();
        try {
            const savedId = await dataManager.saveScene(newScene);
            newScene.id = savedId;
            newScene.isTemporary = false; // Mark as saved

            // Create and link a chat for this scene
            await dataManager.getOrCreateChatForScene(savedId, newScene.name || 'New Scene');

            updateScene(newScene);
            setCurrentView('visualizer');
        } catch (error) {
            console.error('Error saving new scene:', error);
            // Fallback to temporary scene
            updateScene(newScene);
            setCurrentView('visualizer');
        }
    }, [createNewScene, updateScene, setCurrentView, dataManager]);

    const handleOpenScene = useCallback(async (sceneId: string) => {
        if (!dataManager) return;
        try {
            const sceneData = await dataManager.getSceneById(sceneId);
            if (sceneData) {
                updateScene(sceneData);
                setCurrentView('visualizer');
            } else {
                console.error('Scene not found:', sceneId);
            }
        } catch (error) {
            console.error('Error loading scene:', error);
        }
    }, [dataManager, updateScene, setCurrentView]);

    const handleViewCollection = useCallback(() => {
        setCurrentView('collection');
    }, [setCurrentView]);

    if (loading) {
        return (
            <div className="welcome-container">
                <div className="welcome-loading">
                    <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="welcome-container">
            <div className="welcome-content">
                <div className="welcome-header">
                    <h3 className="welcome-title">Welcome to</h3>
                    <div style={{ textAlign: 'center' }}>
                        <img
                            src={logo}
                            alt="Physics Visualizer Logo"
                            style={{
                                width: '100%',
                                height: '100px',
                                objectFit: 'contain'
                            }}
                        />
                    </div>
                    <p className="welcome-subtitle">Create, explore, and learn with interactive physics simulations</p>
                </div>

                <div className="welcome-actions">
                    <div className="action-group">
                        <div className="action-cards">
                            <div className="action-card" onClick={handleCreateNewScene}>
                                <div className="action-card-icon">
                                    <FontAwesomeIcon icon={faPlus} />
                                </div>
                                <div className="action-card-content">
                                    <h3>New Scene</h3>
                                    <p>Create a blank physics simulation</p>
                                </div>
                            </div>
                            
                            <div className="action-card" onClick={() => setCurrentView('chat')}>
                                <div className="action-card-icon">
                                    <FontAwesomeIcon icon={faComments} />
                                </div>
                                <div className="action-card-content">
                                    <h3>New Chat</h3>
                                    <p>Interact with Physics AI Agent</p>
                                </div>
                            </div>

                            <div className="action-card" onClick={handleViewCollection}>
                                <div className="action-card-icon">
                                    <FontAwesomeIcon icon={faCompass} />
                                </div>
                                <div className="action-card-content">
                                    <h3>Explore Examples</h3>
                                    <p>Browse pre-built simulations</p>
                                </div>
                            </div>

                        </div>
                    </div>

                    {recentScenes.length > 0 && (
                        <div className="action-group">
                            <h2 className="action-group-title">Recent</h2>
                            <div className="recent-list">
                                {recentScenes.slice(0, 5).map(scene => (
                                    <div
                                        key={scene.id}
                                        className="recent-item"
                                        onClick={() => scene.id && handleOpenScene(scene.id)}
                                    >
                                        <FontAwesomeIcon icon={faClockRotateLeft} className="recent-icon" />
                                        <span className="recent-name">{scene.name || 'Untitled Scene'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {yourScenes.length > 0 && (
                        <div className="action-group">
                            <h2 className="action-group-title">Your Scenes</h2>
                            <div className="recent-list">
                                {yourScenes.map(scene => (
                                    <div
                                        key={scene.id}
                                        className="recent-item"
                                        onClick={() => scene.id && handleOpenScene(scene.id)}
                                    >
                                        <FontAwesomeIcon icon={faFolderOpen} className="recent-icon" />
                                        <span className="recent-name">{scene.name || 'Untitled Scene'}</span>
                                        <span className="recent-date">
                                            {new Date(scene.updatedAt || 0).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                                {yourScenes.length >= 3 && (
                                    <div className="recent-item more" onClick={handleViewCollection}>
                                        <span className="recent-name">View all scenes...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DashboardView;
