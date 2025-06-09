// src/pages/PhysicsVisualizerPage.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useNavigate, useLocation } from 'react-router-dom';

// Import your custom components
import TopMenu from '../components/TopMenu';
import Visualizer from '../components/Visualizer';
import OverlayGraph from '../components/OverlayGraph';
import RightPanel from '../components/RightPanel';
import LeftPanel from '../components/LeftPanel';
import Conversation from '../components/Conversation';
import SceneSelector from '../components/SceneSelector';

// Import styles and scene data
import './physicsvisualizer.css';
import { mechanicsExamples } from '../scenes.js';

// --- NEW IMPORTS ---
import { useAuth } from '../contexts/AuthContext';
import { useDatabase } from '../contexts/DatabaseContext';
// --------------------

/**
 * PhysicsVisualizerPage Component
 */
function PhysicsVisualizerPage() {
    // Hooks for routing
    const navigate = useNavigate();
    const location = useLocation();

    // --- NEW: Context Hooks ---
    const { currentUser } = useAuth();
    const { queryUserCollection, queryPublicCollection, saveScene, getSceneById } = useDatabase();
    // --------------------------

    // State variables for managing the visualizer and UI
    const [currentScene, setCurrentScene] = useState(mechanicsExamples[0]);
    const [motionData, setMotionData] = useState({});
    const [activeLeftPanel, setActiveLeftPanel] = useState(null);
    const [activeRightPanel, setActiveRightPanel] = useState(null);

    // --- NEW: State for user-specific scenes ---
    const [userScenes, setUserScenes] = useState([]);
    const [loadingUserScenes, setLoadingUserScenes] = useState(false);
    // -------------------------------------------

    // State for the conversation/chat panel
    const [conversationHistory, setConversationHistory] = useState([
        { role: 'ai', content: "Hello! How can I help you with physics today?" }
    ]);
    // State for managing active overlay graphs
    const [activeGraphs, setActiveGraphs] = useState([]);

    // Ref to potentially interact with the Visualizer component directly
    const visualizerRef = useRef(null);

    /**
     * useEffect to handle scene loading based on navigation state.
     * If a scene ID is passed via `location.state.sceneToLoad`, it loads that scene.
     */
    useEffect(() => {
        const loadSceneFromState = async () => {
            if (location.state && location.state.sceneToLoad && getSceneById) {
                const sceneId = location.state.sceneToLoad;
                const isPublic = location.state.isPublic || false;
                console.log(`PhysicsVisualizerPage: Loading scene from route state: ${sceneId}, isPublic: ${isPublic}`);

                // Clear the state from location to prevent re-loading
                navigate(location.pathname, { replace: true, state: {} });

                try {
                    // Try fetching from the database first
                    const loadedScene = await getSceneById(sceneId, isPublic);
                    if (loadedScene) {
                        setCurrentScene(loadedScene);
                    } else {
                         // Fallback to local examples if not found in DB
                        const localScene = mechanicsExamples.find(scene => scene.id === sceneId);
                        if(localScene) {
                            setCurrentScene(localScene);
                        } else {
                            console.warn(`Scene with ID "${sceneId}" not found in database or local examples. Loading default.`);
                            setCurrentScene(mechanicsExamples[0]);
                        }
                    }
                } catch (error) {
                    console.error("Error loading scene from database:", error);
                    setCurrentScene(mechanicsExamples[0]); // Fallback to a default scene on error
                } finally {
                    setMotionData({}); // Clear any existing motion data for the new scene
                    setActiveGraphs([]); // Clear active graphs for a new scene
                }
            }
        };
        loadSceneFromState();
    }, [location.state, navigate, getSceneById]);

    // --- NEW: useEffect to fetch user's scenes ---
    useEffect(() => {
        if (currentUser && queryUserCollection) {
            setLoadingUserScenes(true);
            queryUserCollection('scenes', [
                { field: 'authorId', operator: '==', value: currentUser.uid }
            ], { field: 'createdAt', direction: 'desc' })
            .then(scenes => {
                setUserScenes(scenes);
            })
            .catch(error => {
                console.error("Error fetching user scenes:", error);
                setUserScenes([]); // Set to empty on error
            })
            .finally(() => {
                setLoadingUserScenes(false);
            });
        } else {
            // If user logs out, clear their scenes
            setUserScenes([]);
        }
    }, [currentUser, queryUserCollection]);
    // ---------------------------------------------


    // --- Core Handlers for Visualizer Functionality ---
    const handlePositionUpdate = useCallback((posDataWithId) => {
        const { id, x, y, t } = posDataWithId;
        setMotionData((prevData) => {
            const objectHistory = prevData[id] || [];
            const updatedHistory = [...objectHistory, { x, y, t }];
            return { ...prevData, [id]: updatedHistory };
        });
    }, []);

    const handleSceneChange = useCallback((example) => {
        setCurrentScene(example);
        setMotionData({});
        setActiveGraphs([]);
    }, []);

    const toggleLeftPanel = useCallback((panelName) => {
        setActiveLeftPanel(currentActive => currentActive === panelName ? null : panelName);
    }, []);

    const toggleRightPanel = useCallback((panelName) => {
        setActiveRightPanel(currentActive => currentActive === panelName ? null : panelName);
    }, []);

    const updateConversation = useCallback((newConversation) => {
        setConversationHistory(newConversation);
    }, []);

    const addGraph = useCallback((type) => {
        const newGraph = { id: Date.now(), type: type };
        setActiveGraphs((prev) => [...prev, newGraph]);
    }, []);

    const removeGraph = useCallback((idToRemove) => {
        setActiveGraphs((prev) => prev.filter((graph) => graph.id !== idToRemove));
    }, []);

    // --- TopMenu Action Handlers ---
    const handleOpenDashboard = useCallback(() => navigate('/'), [navigate]);
    const handleOpenSceneCollection = useCallback(() => navigate('/collection'), [navigate]);
    const handleNewScene = useCallback(() => {
        setCurrentScene({ id: 'new_empty_scene', name: 'New Empty Scene', objects: [], properties: {} });
        setMotionData({});
        setActiveGraphs([]);
        setConversationHistory([{ role: 'ai', content: "New scene created! How can I help you with this one?" }]);
    }, []);

    // CHANGED: handleSaveScene now uses the database context
    const handleSaveScene = useCallback(async () => {
        if (!currentUser || !saveScene) {
            alert("You must be logged in to save a scene.");
            return;
        }
        try {
            const sceneToSave = { ...currentScene };
            // Ensure scene has authorId and authorName before saving
            sceneToSave.authorId = currentUser.uid;
            sceneToSave.authorName = currentUser.displayName || "Anonymous";

            const savedSceneId = await saveScene(sceneToSave);
            alert(`Scene "${sceneToSave.name}" saved successfully!`);

            // Optional: update the current scene with the new ID from Firestore
            setCurrentScene(prev => ({...prev, id: savedSceneId}));
            // Refresh the user's scene list
            setUserScenes(prev => [{...sceneToSave, id: savedSceneId}, ...prev.filter(s => s.id !== sceneToSave.id)]);
        } catch (error) {
            console.error("Error saving scene:", error);
            alert("Failed to save scene. See console for details.");
        }
    }, [currentScene, currentUser, saveScene]);

    const handleLoadSpecificScene = useCallback((sceneActionType) => {
        // This function might be deprecated in favor of using SceneSelector, but we'll leave it
        const sceneIdMap = {
            'load_2d_mechanics': '2d_mechanics_example_id',
            'load_3d_mechanics': '3d_mechanics_example_id'
        };
        const sceneToLoad = mechanicsExamples.find(s => s.id === sceneIdMap[sceneActionType]);
        if (sceneToLoad) handleSceneChange(sceneToLoad);
    }, [handleSceneChange]);

    const handleClearChat = useCallback(() => {
        setConversationHistory([{ role: 'ai', content: "Chat cleared! How can I help you now?" }]);
    }, []);

    const handleExportTranscript = useCallback(() => {
        const transcriptText = conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n\n');
        const blob = new Blob([transcriptText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat_transcript_${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [conversationHistory]);

    const handleShowTutorials = useCallback(() => alert("Tutorials not yet implemented."), []);
    const handleShowAbout = useCallback(() => alert("About not yet implemented."), []);
    const handleShowDocumentation = useCallback(() => window.open('https://your-project-docs.com', '_blank'), []);

    return (
        <div className="main">
            <TopMenu
                onOpenDashboard={handleOpenDashboard}
                onOpenSceneCollection={handleOpenSceneCollection}
                onNewScene={handleNewScene}
                onSaveScene={handleSaveScene}
                onLoadScene={handleLoadSpecificScene}
                onClearChat={handleClearChat}
                onExportTranscript={handleExportTranscript}
                onShowTutorials={handleShowTutorials}
                onShowAbout={handleShowAbout}
                onShowDocumentation={handleShowDocumentation}
                onAddGraph={addGraph}
            />

            <PanelGroup direction="vertical" className="flex-grow">
                <Panel className="main-panel" defaultSize={100}>
                    <PanelGroup direction="horizontal">
                        <div className="left-section">
                            <LeftPanel
                                onSceneExamples={() => toggleLeftPanel('scene-examples')}
                                onCreateScene={() => toggleLeftPanel('create-scene')}
                                onUploadScene={() => toggleLeftPanel('upload-scene')}
                            />
                        </div>

                        {/* --- CHANGED: CONDITIONAL RENDERING FOR SCENE SELECTOR --- */}
                        {activeLeftPanel === 'scene-examples' && (
                            <>
                                <Panel className="component-section examples-panel" defaultSize={30} minSize={15} order={0}>
                                    {/* Only render SceneSelector if the required database functions are ready */}
                                    {queryPublicCollection && queryUserCollection ? (
                                        <SceneSelector
                                            currentScene={currentScene}
                                            onSceneChange={handleSceneChange}
                                            conversationHistory={conversationHistory}
                                            // --- NEW PROPS BEING PASSED DOWN ---
                                            userScenes={userScenes}
                                            loadingUserScenes={loadingUserScenes}
                                            queryPublicCollection={queryPublicCollection}
                                            // ------------------------------------
                                        />
                                    ) : (
                                        <div className="loading-message">Loading Scene Panel...</div>
                                    )}
                                </Panel>
                                <PanelResizeHandle className="resize-handle" />
                            </>
                        )}
                        {/* ----------------------------------------------------------- */}

                        <Panel className="visualization-section" defaultSize={70} minSize={30} order={1}>
                            <div className="content-section">
                                <Visualizer
                                    key={currentScene.id}
                                    scene={currentScene}
                                    onPositionUpdate={handlePositionUpdate}
                                />
                                {activeGraphs.map((graph) => (
                                    <OverlayGraph
                                        key={graph.id}
                                        id={graph.id}
                                        initialType={graph.type}
                                        data={motionData}
                                        onClose={removeGraph}
                                    />
                                ))}
                            </div>
                        </Panel>

                        {activeRightPanel === 'chat' && (
                            <>
                                <PanelResizeHandle className="resize-handle" />
                                <Panel className="solution-section" minSize={15} defaultSize={30} order={2}>
                                    <div className="content-section">
                                        <Conversation
                                            updateConversation={updateConversation}
                                            conversationHistory={conversationHistory}
                                        />
                                    </div>
                                </Panel>
                            </>
                        )}

                        <div className="right-section">
                            <RightPanel
                                onChat={() => toggleRightPanel('chat')}
                                onProperties={() => toggleRightPanel('properties')}
                            />
                        </div>
                    </PanelGroup>
                </Panel>
            </PanelGroup>
        </div>
    );
}

export default PhysicsVisualizerPage;