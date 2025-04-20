// src/App.js
import React, { useState, useCallback } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import TopMenu from './TopMenu';
import Visualizer from './Visualizer';
// import Graph from './Graph'; // Remove Graph import
import OverlayGraph from './OverlayGraph'; // Import the new OverlayGraph
import Conversation from './Conversation';
import SceneSelector from './SceneSelector';
import './App.css';
import { mechanicsExamples } from './scenes.js';

function App() {
  const [currentScene, setCurrentScene] = useState(mechanicsExamples[0]);
  const [motionData, setMotionData] = useState({});
  const [conversationHistory, setConversationHistory] = useState([
    { role: 'ai', content: "Hello! How can I help you with physics today?" }
  ]);
  // State to manage active graph overlays
  const [activeGraphs, setActiveGraphs] = useState([]); // Array of { id: number, type: string }

  const handlePositionUpdate = (posDataWithId) => {
    const { id, x, y, z, t } = posDataWithId;
    setMotionData((prevData) => {
      const objectHistory = prevData[id] || [];
      // Ensure we store necessary data (x, y, t for plotting)
      const updatedHistory = [...objectHistory, { x, y, t }];
      // Limit history size if needed (e.g., keep last 500 points)
      // const MAX_POINTS = 500;
      // if (updatedHistory.length > MAX_POINTS) {
      //   updatedHistory.splice(0, updatedHistory.length - MAX_POINTS);
      // }
      return { ...prevData, [id]: updatedHistory };
    });
  };

  const handleSceneChange = (example) => {
    setCurrentScene(example);
    setMotionData({}); // Reset motion data
    // Optionally close all graphs on scene change?
    // setActiveGraphs([]);
  };

  const updateConversation = useCallback((newConversation) => {
    setConversationHistory(newConversation);
  }, []);

  // Function to add a new graph overlay
  const addGraph = useCallback((type) => {
      const newGraph = {
          id: Date.now(), // Simple unique ID using timestamp
          type: type,
      };
      setActiveGraphs(prev => [...prev, newGraph]);
  }, []); // No dependencies needed if it only uses Date.now()

  // Function to remove a graph overlay by its ID
  const removeGraph = useCallback((idToRemove) => {
      setActiveGraphs(prev => prev.filter(graph => graph.id !== idToRemove));
  }, []); // No dependencies needed

  return (
    <div className="main">
      {/* Pass addGraph function to TopMenu */}
      <TopMenu onAddGraph={addGraph} />

      <PanelGroup direction="vertical">
        <Panel className="main-panel" defaultSize={90}>
          <PanelGroup direction="horizontal">
            {/* Scene Selector Panel */}
            <Panel className="component-section examples-panel" defaultSize={20} minSize={15}>
              <SceneSelector
                currentScene={currentScene}
                onSceneChange={handleSceneChange}
                conversationHistory={conversationHistory} // Pass if needed by SceneSelector
              />
            </Panel>
            <PanelResizeHandle className="resize-handle" />

            {/* Visualizer Panel (takes more space now) */}
            {/* Combine original Visualizer (35) + Graph (25) = 60, adjust Conversation slightly */}
            <Panel className="visualization-section" defaultSize={55} minSize={30}>
              {/* This container needs position: relative (added via CSS) */}
              <div className="content-section">
                <Visualizer
                  key={currentScene.id}
                  scene={currentScene}
                  onPositionUpdate={handlePositionUpdate}
                />
                {/* Render Active Graph Overlays Here */}
                {activeGraphs.map(graph => (
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
            <PanelResizeHandle className="resize-handle" />

            {/* REMOVED Graph Panel Section */}
            {/* <Panel className="graph-section" defaultSize={25} minSize={15}>
                ...
            </Panel>
            <PanelResizeHandle className="resize-handle" /> */}

            {/* Conversation Panel */}
            <Panel className="solution-section" defaultSize={25} minSize={15}> {/* Slightly increased size */}
              <div className="content-section">
                <Conversation
                  updateConversation={updateConversation}
                  conversationHistory={conversationHistory}
                />
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
        {/* Optional: Add another vertical panel here if needed */}
      </PanelGroup>
    </div>
  );
}

export default App;