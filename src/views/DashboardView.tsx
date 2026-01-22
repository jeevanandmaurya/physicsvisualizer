import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCompass, faComments, faArrowRight } from '@fortawesome/free-solid-svg-icons';

import logo from '../assets/physicsvisualizer.svg';

import { useDatabase } from '../contexts/DatabaseContext';
import { useWorkspace, useWorkspaceScene } from '../contexts/WorkspaceContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useSceneCache } from '../contexts/SceneCacheContext';
import { InfiniteSceneGrid } from './components/explore/InfiniteSceneGrid';
import './DashboardView.css';

function DashboardView() {
    const { setCurrentView } = useNavigation();
    const { updateScene } = useWorkspaceScene();
    const { addChatSession, setChatOverlayCurrentChat } = useWorkspace();
    const { 
        exampleScenes, userScenes, recentScenes, 
        loadExampleScenes, loadUserScenes, loadRecentScenes,
        loading,
        dataLoaded,
        exampleDisplayCount, userDisplayCount,
        incrementExampleDisplayCount, incrementUserDisplayCount
    } = useSceneCache();
    
    const dataManager = useDatabase();

    // Helper to generate a default new scene
    const createNewScene = useCallback(() => ({
        id: `new-${Date.now()}`,
        name: 'New Scene',
        description: 'A new physics simulation.',
        isTemporary: true,
        gravity: [0, -9.81, 0],
        hasGround: true,
        simulationScale: 'terrestrial',
        gravitationalPhysics: { enabled: false },
        objects: []
    }), []);

    useEffect(() => {
        loadRecentScenes();
        loadUserScenes();
        loadExampleScenes();
    }, [loadRecentScenes, loadUserScenes, loadExampleScenes]);

    const handleCreateNewScene = useCallback(async () => {
        if (!dataManager) return;
        const newScene = createNewScene();
        try {
            const savedId = await dataManager.saveScene(newScene);
            newScene.id = savedId;
            newScene.isTemporary = false;

            // Create a new chat session for this scene
            const newChat = addChatSession();
            if (newChat) {
                await dataManager.getOrCreateChatForScene(savedId, newScene.name || 'New Scene');
                setChatOverlayCurrentChat(newChat.id);
            }

            updateScene(newScene);
            setCurrentView('visualizer');
        } catch (error) {
            console.error('Error saving new scene:', error);
            updateScene(newScene);
            setCurrentView('visualizer');
        }
    }, [createNewScene, updateScene, setCurrentView, dataManager, addChatSession, setChatOverlayCurrentChat]);

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

    const handleCardClick = (sceneId: string, isPublic: boolean) => {
        handleOpenScene(sceneId);
    };

    return (
        <div className="dashboard-container">
            {/* Hero Section */}
            <section className="dashboard-hero">
                <img src={logo} alt="Physics Visualizer" className="dashboard-logo" />
                <p className="dashboard-subtitle">
                    Build, simulate, and explore interactive physics worlds in real-time.
                </p>
                <div className="hero-actions">
                    <button className="action-btn primary" onClick={handleCreateNewScene}>
                        <FontAwesomeIcon icon={faPlus} />
                        Create New Scene
                    </button>
                    <button className="action-btn secondary" onClick={() => setCurrentView('chat')}>
                        <FontAwesomeIcon icon={faComments} />
                        Physics AI Chat
                    </button>
                    <button className="action-btn secondary" onClick={handleViewCollection}>
                        <FontAwesomeIcon icon={faCompass} />
                        Explore Library
                    </button>
                </div>
            </section>

            {/* Recent / Your Scenes */}
            <section className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">Your Recent Scenes</h2>
                    <div className="view-all-link" onClick={handleViewCollection}>
                        View All <FontAwesomeIcon icon={faArrowRight} />
                    </div>
                </div>
                
                <InfiniteSceneGrid
                    scenes={userScenes}
                    loading={loading.user}
                    dataLoaded={dataLoaded.user}
                    displayCount={userDisplayCount}
                    onLoadMore={incrementUserDisplayCount}
                    isPublic={false}
                    onSceneClick={handleCardClick}
                    emptyMessage={
                        <div className="empty-state" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                            <p>You haven't created any scenes yet.</p>
                            <button className="action-btn secondary" onClick={handleCreateNewScene} style={{ marginTop: '10px' }}>
                                Start Creating
                            </button>
                        </div>
                    }
                    skeletonsCount={4}
                />
            </section>

            {/* Featured Examples */}
            <section className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">Featured Examples</h2>
                    <div className="view-all-link" onClick={handleViewCollection}>
                        Explore All <FontAwesomeIcon icon={faArrowRight} />
                    </div>
                </div>

                <InfiniteSceneGrid
                    scenes={exampleScenes}
                    loading={loading.examples}
                    dataLoaded={dataLoaded.examples}
                    displayCount={exampleDisplayCount}
                    onLoadMore={incrementExampleDisplayCount}
                    isPublic={true}
                    onSceneClick={handleCardClick}
                    emptyMessage="No examples available at the moment."
                    skeletonsCount={4}
                />
            </section>
        </div>
    );
}

export default DashboardView;
