import React, { useState, useCallback, useRef, useEffect } from "react";
import {
    PanelGroup,
    Panel,
    PanelResizeHandle,
} from "react-resizable-panels";
import { useNavigate, useLocation, useRoutes } from "react-router-dom";

// --- Component Imports ---
import TopMenu from "../components/TopMenu";
import Visualizer from "../components/Visualizer";
import LeftPanel from "../components/LeftPanel";
import RightPanel from "../components/RightPanel";
import SceneSelector from "../components/SceneSelector";
import Conversation from "../components/Conversation";
import SceneDetails from "../components/SceneDetails";

// --- Style and Context Imports ---
import "./physicsvisualizer.css";
import { useAuth } from "../contexts/AuthContext";
import { useDatabase } from "../contexts/DatabaseContext";

/**
 * The main application page, orchestrating all panels and components.
 */
function PhysicsVisualizerPage() {
    // --- Hooks ---
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();
    const dataManager = useDatabase();

    // --- Core State ---
    const [currentScene, setCurrentScene] = useState(null);
    const [isLoadingScene, setIsLoadingScene] = useState(true);

    // --- UI Panel State ---
    const [activeLeftPanel, setActiveLeftPanel] = useState(null); // 'scene-examples' or null
    const [activeRightPanel, setActiveRightPanel] = useState(null); // 'chat' or 'properties'

    // --- Data State ---
    const [userScenes, setUserScenes] = useState([]);
    const [loadingUserScenes, setLoadingUserScenes] = useState(false);
    const [extractedScenes, setExtractedScenes] = useState([]);
    const [conversationHistory, setConversationHistory] = useState([
        { role: "ai", content: "Hello! How can I help you with physics today?" },
    ]);
    const [motionData, setMotionData] = useState({}); // Note: Unused variables, might need cleanup
    const [activeGraphs, setActiveGraphs] = useState([]); // Note: Unused variables, might need cleanup
    const visualizerRef = useRef(null); // Note: Unused variables, might need cleanup

    // Panel refs for imperative control
    const leftPanelRef = useRef(null);
    const rightPanelRef = useRef(null);

    // --- Effects for Data Loading ---

    // Effect to load the initial scene on page mount or from navigation state
    useEffect(() => {
        const loadScene = async () => {
            setIsLoadingScene(true);
            let sceneToLoad;
            try {
                const sceneState = location.state;
                if (sceneState?.sceneToLoad) {
                    navigate(location.pathname, { replace: true, state: {} });
                    if (sceneState.sceneToLoad === "new_empty_scene") {
                        sceneToLoad = {
                            id: `new-${Date.now()}`,
                            name: "New Empty Scene",
                            description: "A blank canvas.",
                            objects: [],
                            gravity: [0, -9.81, 0],
                            hasGround: true,
                            isTemporary: true,
                        };
                    } else {
                        sceneToLoad = await dataManager.getSceneById(
                            sceneState.sceneToLoad,
                            sceneState.isPublic || false
                        );
                    }
                }
                if (!sceneToLoad) {
                    const [defaultScene] = await dataManager.getScenes("examples");
                    sceneToLoad = defaultScene;
                }
                setCurrentScene(sceneToLoad);
            } catch (error) {
                console.error("Error loading scene:", error);
                setCurrentScene({
                    id: "error-scene",
                    name: "Error Loading Scene",
                    objects: [],
                });
            } finally {
                setIsLoadingScene(false);
            }
        };
        loadScene();
    }, [location.state, navigate, dataManager]);

    // Effect to fetch the user's saved scenes when they log in
    useEffect(() => {
        if (currentUser && dataManager) {
            setLoadingUserScenes(true);
            dataManager
                .getScenes("user", {
                    orderBy: { field: "updatedAt", direction: "desc" },
                })
                .then(setUserScenes)
                .catch((error) => console.error("Error fetching user scenes:", error))
                .finally(() => setLoadingUserScenes(false));
        } else {
            setUserScenes([]);
            setExtractedScenes([]);
        }
    }, [currentUser, dataManager]);

    // --- Callback Handlers ---

    const handleSceneChange = useCallback((newScene) => {
        setCurrentScene(newScene);
        // Reset simulation-specific state if needed
        // setMotionData({});
        // setActiveGraphs([]);
    }, []);

    const handleExtractedScene = useCallback((extractedScene) => {
        // Normalize the scene object and mark it as temporary
        const normalizedScene = {
            ...extractedScene,
            id: extractedScene.id || `extracted-${Date.now()}`,
            isExtracted: true,
            isTemporary: true,
        };
        setExtractedScenes((prev) => [normalizedScene, ...prev]);
        setCurrentScene(normalizedScene);
    }, []);

    const handleSaveScene = useCallback(async () => {
        if (!currentUser) return alert("You must be logged in to save a scene.");
        if (!currentScene) return alert("No active scene to save.");

        try {
            const savedId = await dataManager.saveScene(currentScene);
            const savedScene = await dataManager.getSceneById(savedId);
            alert(`Scene "${savedScene.name}" saved successfully!`);

            setCurrentScene(savedScene);
            if (currentScene.isExtracted) {
                setExtractedScenes((prev) =>
                    prev.filter((s) => s.id !== currentScene.id)
                );
            }
            setUserScenes((prev) => [
                savedScene,
                ...prev.filter((s) => s.id !== savedId),
            ]);
        } catch (error) {
            console.error("Error saving scene:", error);
            alert(`Failed to save scene: ${error.message}`);
        }
    }, [currentScene, currentUser, dataManager]);

    const handleNewScene = useCallback(() => {
        const newScene = {
            id: `new-${Date.now()}`,
            name: "New Empty Scene",
            description: "A blank canvas.",
            objects: [],
            gravity: [0, -9.81, 0],
            hasGround: true,
            isTemporary: true,
        };
        handleSceneChange(newScene);
    }, [handleSceneChange]);

    // These functions will be passed as props to TopMenu.
    const handleOpenDashboard = useCallback(() => {
        navigate('/');
    }, [navigate]);

    const handleOpenSceneCollection = useCallback(() => {
        navigate('/collection');
    }, [navigate]);


    const toggleLeftPanel = useCallback(
        (panelName) => {
            const newActivePanel = activeLeftPanel === panelName ? null : panelName;
            setActiveLeftPanel(newActivePanel);

            // Control panel size imperatively
            if (leftPanelRef.current) {
                if (newActivePanel === "scene-examples") {
                    leftPanelRef.current.resize(25);
                } else {
                    leftPanelRef.current.collapse();
                }
            }
        },
        [activeLeftPanel]
    );

    const toggleRightPanel = useCallback(
        (panelName) => {
            const newActivePanel = activeRightPanel === panelName ? null : panelName;
            setActiveRightPanel(newActivePanel);

            // Control panel size imperatively
            if (rightPanelRef.current) {
                if (newActivePanel) {
                    const size = newActivePanel === "chat" ? 30 : 25;
                    rightPanelRef.current.resize(size);
                } else {
                    rightPanelRef.current.collapse();
                }
            }
        },
        [activeRightPanel]
    );

    // --- Render Logic ---

    if (isLoadingScene || !currentScene) {
        return (
            <div className="loading-fullscreen">Loading Physics Visualizer...</div>
        );
    }

    // Determine default size for the right panel based on its content
    const rightPanelDefaultSize = activeRightPanel === "chat" ? 30 : 25;

    return (
        <div className="main">
            <TopMenu
                onSaveScene={handleSaveScene}

                isCurrentSceneUnsaved={!!currentScene.isTemporary}
                {...{ handleNewScene }}

                onOpenDashboard={handleOpenDashboard}
                onOpenSceneCollection={handleOpenSceneCollection}

            />
            <PanelGroup direction="vertical" className="flex-grow">
                <Panel className="main-panel">
                    <PanelGroup direction="horizontal">
                        {/* --- LEFT TOOLBAR --- */}
                        <div className="left-section">
                            <LeftPanel
                                onSceneExamples={() => toggleLeftPanel("scene-examples")}
                            />
                        </div>

                        {/* --- (Conditional) LEFT PANEL (Scene Selector) --- */}
                        {activeLeftPanel === "scene-examples" && (
                            <>
                                <Panel
                                    ref={leftPanelRef}
                                    order={1}
                                    collapsible={true}
                                    collapsedSize={0}
                                    minSize={15}
                                    className="component-section examples-panel"
                                    defaultSize={25}
                                >
                                    <SceneSelector
                                        {...{
                                            currentScene,
                                            handleSceneChange,
                                            conversationHistory,
                                            userScenes,
                                            loadingUserScenes,
                                            extractedScenes,
                                            handleExtractedScene,
                                            currentUser,
                                        }}
                                    />
                                </Panel>
                                <PanelResizeHandle className="resize-handle" />
                            </>
                        )}

                        {/* --- CENTER VISUALIZATION --- */}
                        <Panel order={2} className="visualization-section" minSize={30}>
                            <Visualizer key={currentScene.id} scene={currentScene} />
                        </Panel>

                        {/* --- (Conditional) RIGHT PANEL (DYNAMIC CONTENT) --- */}
                        {activeRightPanel && (
                            <>
                                <PanelResizeHandle className="resize-handle" />
                                <Panel
                                    ref={rightPanelRef}
                                    order={3}
                                    collapsible={true}
                                    collapsedSize={0}
                                    minSize={15}
                                    className={
                                        activeRightPanel === "properties"
                                            ? "properties-section"
                                            : "solution-section"
                                    }
                                    defaultSize={rightPanelDefaultSize}
                                >
                                    {activeRightPanel === "chat" && (
                                        <Conversation
                                            {...{
                                                conversationHistory,
                                                updateConversation: setConversationHistory,
                                            }}
                                        />
                                    )}
                                    {activeRightPanel === "properties" && (
                                        <SceneDetails scene={currentScene} />
                                    )}
                                </Panel>
                            </>
                        )}

                        {/* --- RIGHT TOOLBAR --- */}
                        <div className="right-section">
                            <RightPanel
                                onChat={() => toggleRightPanel("chat")}
                                onProperties={() => toggleRightPanel("properties")}
                            />
                        </div>
                    </PanelGroup>
                </Panel>
            </PanelGroup>
        </div>
    );
}

export default PhysicsVisualizerPage;