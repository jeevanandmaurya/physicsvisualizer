// src/pages/PhysicsVisualizerPage.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Ensure this is installed if used
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate and useLocation for routing

// Import your custom components
import TopMenu from '../components/TopMenu';
import Visualizer from '../components/Visualizer';
import OverlayGraph from '../components/OverlayGraph';
import RightPanel from '../components/RightPanel.jsx';
import LeftPanel from '../components/LeftPanel.jsx';
import Conversation from '../components/Conversation';
import SceneSelector from '../components/SceneSelector';

// Import styles and scene data
import './physicsvisualizer.css'; // Assuming this contains global app styles or specific page styles
import { mechanicsExamples } from '../scenes.js'; // Assuming this file exports scene data

/**
 * PhysicsVisualizerPage Component
 *
 * This component serves as the main container for the physics visualization environment.
 * It manages the layout, state for the visualizer, chat, graphs, and integrates the TopMenu
 * for various actions.
 */
function PhysicsVisualizerPage() {
    // Hooks for routing
    const navigate = useNavigate(); // Used to programmatically navigate to other routes
    const location = useLocation(); // Used to access state passed during navigation (e.g., sceneToLoad)

    // State variables for managing the visualizer and UI
    const [currentScene, setCurrentScene] = useState(mechanicsExamples[0]); // The currently loaded physics scene
    const [motionData, setMotionData] = useState({}); // Stores historical position data for graphing
    const [activeLeftPanel, setActiveLeftPanel] = useState(null); // Controls which left-side panel is open (e.g., 'scene-examples')
    const [activeRightPanel, setActiveRightPanel] = useState(null); // Controls which right-side panel is open (e.g., 'chat')

    // State for the conversation/chat panel
    const [conversationHistory, setConversationHistory] = useState([
        { role: 'ai', content: "Hello! How can I help you with physics today?" }
    ]);
    // State for managing active overlay graphs
    const [activeGraphs, setActiveGraphs] = useState([]);

    // Ref to potentially interact with the Visualizer component directly (e.g., calling methods)
    const visualizerRef = useRef(null);

    /**
     * useEffect to handle scene loading based on navigation state.
     * If a scene ID is passed via `location.state.sceneToLoad`, it loads that scene.
     */
    useEffect(() => {
        if (location.state && location.state.sceneToLoad) {
            const sceneType = location.state.sceneToLoad;
            console.log(`PhysicsVisualizerPage: Loading scene from route state: ${sceneType}`);

            // Find the scene object from your predefined examples based on the ID
            const loadedScene = mechanicsExamples.find(scene => scene.id === sceneType);

            if (loadedScene) {
                setCurrentScene(loadedScene);
                setMotionData({}); // Clear any existing motion data for the new scene
                setActiveGraphs([]); // Clear active graphs for a new scene
            } else {
                console.warn(`Scene with ID "${sceneType}" not found. Loading default scene.`);
                setCurrentScene(mechanicsExamples[0]); // Fallback to a default scene
            }

            // Clear the state from location to prevent re-loading the same scene
            // if the user navigates back to /visualizer without a new scene specified.
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate]); // Dependencies: re-run if location.state or navigate function changes

    // --- Core Handlers for Visualizer Functionality ---

    /**
     * Callback function to update motion data for objects in the visualizer.
     * This data is used by the graphing components.
     * @param {object} posDataWithId - Object containing id, x, y, z, and t (time)
     */
    const handlePositionUpdate = useCallback((posDataWithId) => {
        const { id, x, y, t } = posDataWithId; // Assuming z is not needed for current graphs
        setMotionData((prevData) => {
            const objectHistory = prevData[id] || [];
            const updatedHistory = [...objectHistory, { x, y, t }]; // Store x, y, t
            return { ...prevData, [id]: updatedHistory };
        });
    }, []); // No dependencies, so this function reference is stable

    /**
     * Callback function to change the active physics scene.
     * @param {object} example - The new scene object to load.
     */
    const handleSceneChange = useCallback((example) => {
        setCurrentScene(example);
        setMotionData({}); // Clear motion data for the new scene
        setActiveGraphs([]); // Clear any active graphs
        // If Visualizer has a reset method and you're using a ref:
        // if (visualizerRef.current && visualizerRef.current.reset) {
        //     visualizerRef.current.reset();
        // }
    }, []); // No dependencies, so this function reference is stable

    /**
     * Toggles the visibility of the left-side panel.
     * @param {string} panelName - The name of the panel to toggle (e.g., 'scene-examples').
     */
    const toggleLeftPanel = useCallback((panelName) => {
        setActiveLeftPanel(currentActive => currentActive === panelName ? null : panelName);
    }, []); // No dependencies, so this function reference is stable

    /**
     * Toggles the visibility of the right-side panel.
     * @param {string} panelName - The name of the panel to toggle (e.g., 'chat').
     */
    const toggleRightPanel = useCallback((panelName) => {
        setActiveRightPanel(currentActive => currentActive === panelName ? null : panelName);
    }, []); // No dependencies, so this function reference is stable

    /**
     * Callback function to update the conversation history in the chat panel.
     * @param {Array<object>} newConversation - The updated array of conversation messages.
     */
    const updateConversation = useCallback((newConversation) => {
        setConversationHistory(newConversation);
    }, []); // No dependencies, so this function reference is stable

    /**
     * Callback function to add a new graph overlay.
     * @param {string} type - The type of graph to add (e.g., 'xy', 'time_position').
     */
    const addGraph = useCallback((type) => {
        const newGraph = {
            id: Date.now(), // Use a unique ID for each graph instance
            type: type,
        };
        setActiveGraphs((prev) => [...prev, newGraph]);
    }, []); // No dependencies, so this function reference is stable

    /**
     * Callback function to remove an active graph overlay.
     * @param {number} idToRemove - The unique ID of the graph to remove.
     */
    const removeGraph = useCallback((idToRemove) => {
        setActiveGraphs((prev) => prev.filter((graph) => graph.id !== idToRemove));
    }, []); // No dependencies, so this function reference is stable

    // --- TopMenu Action Handlers (Specific to PhysicsVisualizerPage) ---

    /**
     * Handles the "Open Dashboard" action from the TopMenu.
     * Navigates the user back to the main dashboard page.
     */
    const handleOpenDashboard = useCallback(() => {
        console.log("Navigating from Visualizer to Dashboard...");
        navigate('/'); // Use react-router-dom's navigate function
    }, [navigate]); // Depends on `navigate` function

     const handleOpenSceneCollection = useCallback(() => {
        console.log("Navigating from Visualizer to SceneCollection...");
        navigate('/collection'); // Use react-router-dom's navigate function
    }, [navigate]); // Depends on `navigate` function

    /**
     * Handles the "New Scene" action from the TopMenu.
     * Resets the visualizer to an empty/default scene state.
     */
    const handleNewScene = useCallback(() => {
        console.log("Visualizer: Creating a new (empty) scene.");
        // Define a simple empty scene structure
        setCurrentScene({ id: 'new_empty_scene', name: 'New Empty Scene', objects: [], properties: {} });
        setMotionData({}); // Clear any previous motion data
        setActiveGraphs([]); // Clear active graphs for a new scene
        setConversationHistory([{ role: 'ai', content: "New scene created! How can I help you with this one?" }]);
        // If Visualizer has a reset method, call it via ref:
        // if (visualizerRef.current && visualizerRef.current.resetScene) {
        //     visualizerRef.current.resetScene();
        // }
        // You might also want to open a modal for scene configuration here.
    }, []); // No dependencies, so this function reference is stable

    /**
     * Handles the "Save Scene" action from the TopMenu.
     * Placeholder for actual scene saving logic.
     */
    const handleSaveScene = useCallback(() => {
        console.log("Visualizer: Initiating save for the current scene.");
        // In a real application, you would:
        // 1. Get the current state of the scene (e.g., from `currentScene` state, or from `visualizerRef.current.getSceneState()`)
        // 2. Send this data to a backend API or save it to local storage/Firestore.
        // 3. Provide user feedback (e.g., "Scene saved!", "Error saving scene").
        alert(`Saving scene "${currentScene.name}" (Save logic to be implemented!)`);
    }, [currentScene]); // Depends on `currentScene` if the save logic needs its data

    /**
     * Handles loading specific predefined scenes from the "Scenes" menu.
     * @param {string} sceneActionType - The action string from TopMenu (e.g., 'load_2d_mechanics').
     */
    const handleLoadSpecificScene = useCallback((sceneActionType) => {
        console.log(`Visualizer: Loading predefined scene: ${sceneActionType}`);
        let sceneToLoad = null;

        // Map the action type to an actual scene ID or object
        switch (sceneActionType) {
            case 'load_2d_mechanics':
                sceneToLoad = mechanicsExamples.find(s => s.id === '2d_mechanics_example_id'); // Replace with actual ID from your scenes.js
                break;
            case 'load_3d_mechanics':
                sceneToLoad = mechanicsExamples.find(s => s.id === '3d_mechanics_example_id'); // Replace with actual ID
                break;
            default:
                console.warn(`Unknown scene type to load: ${sceneActionType}`);
                break;
        }

        if (sceneToLoad) {
            setCurrentScene(sceneToLoad);
            setMotionData({}); // Clear old motion data for the new scene
            setActiveGraphs([]); // Clear old graphs
            setConversationHistory([{ role: 'ai', content: `Loaded "${sceneToLoad.name}". What's next?` }]);
        } else {
            alert(`Scene type "${sceneActionType}" not found in examples.`);
        }
    }, []); // No dependencies that change over time for this simple example

    /**
     * Handles the "Clear Chat" action from the TopMenu.
     * Resets the conversation history.
     */
    const handleClearChat = useCallback(() => {
        console.log("Visualizer: Clearing chat conversation.");
        setConversationHistory([{ role: 'ai', content: "Chat cleared! How can I help you now?" }]); // Reset to initial greeting
        alert("Chat has been cleared!");
    }, []); // No dependencies, so this function reference is stable

    /**
     * Handles the "Export Transcript" action from the TopMenu.
     * Downloads the current conversation history as a text file.
     */
    const handleExportTranscript = useCallback(() => {
        console.log("Visualizer: Exporting chat transcript.");
        // Format the conversation history for export
        const transcriptText = conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n\n');
        const blob = new Blob([transcriptText], { type: 'text/plain;charset=utf-8' });
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `chat_transcript_${new Date().toISOString().slice(0, 10)}.txt`; // Filename with date
        document.body.appendChild(downloadLink);
        downloadLink.click(); // Programmatically click the link to trigger download
        document.body.removeChild(downloadLink); // Clean up the temporary link
        URL.revokeObjectURL(downloadLink.href); // Release the object URL
        alert("Chat transcript exported successfully!");
    }, [conversationHistory]); // Depends on `conversationHistory` to get the latest transcript

    /**
     * Handles the "Tutorials" action from the TopMenu.
     * Placeholder for showing tutorials (e.g., opening a modal).
     */
    const handleShowTutorials = useCallback(() => {
        console.log("Visualizer: Showing tutorials.");
        // This would typically open a tutorial modal or navigate to an internal tutorial page
        alert("Tutorials functionality needs to be implemented (e.g., open a modal)!");
    }, []); // No dependencies, so this function reference is stable

    /**
     * Handles the "About" action from the TopMenu.
     * Placeholder for displaying about information (e.g., opening a modal).
     */
    const handleShowAbout = useCallback(() => {
        console.log("Visualizer: Displaying about information.");
        // This would typically open an "About" modal
        alert("About functionality needs to be implemented (e.g., open a modal)!");
    }, []); // No dependencies, so this function reference is stable

    /**
     * Handles the "Documentation" action from the TopMenu.
     * Opens an external link to the project's documentation.
     */
    const handleShowDocumentation = useCallback(() => {
        console.log("Visualizer: Opening documentation.");
        // IMPORTANT: Replace 'https://your-project-docs.com' with your actual documentation URL
        window.open('https://your-project-docs.com', '_blank');
    }, []); // No dependencies, so this function reference is stable


    return (
        <div className="main"> {/* This is the root div for the visualizer page */}
            {/* Top Menu Component - receives all action handlers as props */}
            <TopMenu
                onOpenDashboard={handleOpenDashboard}
                onOpenSceneCollection={handleOpenSceneCollection}
                onNewScene={handleNewScene}
                onSaveScene={handleSaveScene}
                onLoadScene={handleLoadSpecificScene} // Specific handler for loading scene types
                onClearChat={handleClearChat}
                onExportTranscript={handleExportTranscript}
                onShowTutorials={handleShowTutorials}
                onShowAbout={handleShowAbout}
                onShowDocumentation={handleShowDocumentation}
                onAddGraph={addGraph} // Pass the addGraph function for the Graphs menu
            />

            {/* Main layout using react-resizable-panels */}
            <PanelGroup direction="vertical" className="flex-grow"> {/* Added flex-grow to fill remaining space */}
                <Panel className="main-panel" defaultSize={100}>
                    <PanelGroup direction="horizontal">
                        {/* Left Section for control buttons */}
                        <div className="left-section">
                            <LeftPanel
                                onSceneExamples={() => toggleLeftPanel('scene-examples')}
                                onCreateScene={() => toggleLeftPanel('create-scene')} // Corrected typo
                                onUploadScene={() => toggleLeftPanel('upload-scene')}
                            />
                        </div>

                        {/* Scene Selector Panel (conditionally rendered) */}
                        {activeLeftPanel === 'scene-examples' && (
                            <>
                                <Panel className="component-section examples-panel" defaultSize={30} minSize={15} order={0}>
                                    <SceneSelector
                                        currentScene={currentScene}
                                        onSceneChange={handleSceneChange}
                                        conversationHistory={conversationHistory}
                                    />
                                </Panel>
                                <PanelResizeHandle className="resize-handle" /> {/* Resizer between panels */}
                            </>
                        )}

                        {/* Main Visualization Panel */}
                        <Panel className="visualization-section" defaultSize={70} minSize={30} order={1}>
                            <div className="content-section">
                                <Visualizer
                                    key={currentScene.id} // Key ensures Visualizer remounts when scene changes
                                    scene={currentScene}
                                    onPositionUpdate={handlePositionUpdate}
                                    // You might pass the ref here if Visualizer needs external method calls
                                    // ref={visualizerRef}
                                />
                                {/* Render active Overlay Graphs */}
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

                        {/* Conversation Panel (conditionally rendered) */}
                        {activeRightPanel === 'chat' && (
                            <>
                                <PanelResizeHandle className="resize-handle" /> {/* Resizer between panels */}
                                <Panel
                                    className="solution-section"
                                    minSize={15}
                                    defaultSize={30}
                                    order={2}
                                >
                                    <div className="content-section">
                                        <Conversation
                                            updateConversation={updateConversation}
                                            conversationHistory={conversationHistory}
                                        />
                                    </div>
                                </Panel>
                            </>
                        )}

                        {/* Right Section for control buttons */}
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
