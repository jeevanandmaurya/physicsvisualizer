import React, { useState, useCallback } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import TopMenu from './TopMenu';
import Visualizer from './Visualizer';
import Graph from './Graph'; // Import the corrected Graph component
import Conversation from './Conversation';
import SceneSelector from './SceneSelector';
import './App.css'; // Import corrected App.css
import { mechanicsExamples } from './scenes.js';

function App() {
  const [currentScene, setCurrentScene] = useState(mechanicsExamples[0]);
  const [motionData, setMotionData] = useState({});
  const [conversationHistory, setConversationHistory] = useState([
    { role: 'ai', content: "Hello! How can I help you with physics today?" }
  ]);

  // --- (Keep your existing state update functions: handlePositionUpdate, handleSceneChange, updateConversation) ---
  const handlePositionUpdate = (posDataWithId) => {
    const { id, x, y, z, t } = posDataWithId;
    setMotionData((prevData) => {
      const objectHistory = prevData[id] || [];
      // Ensure we store necessary data (x, y, t for plotting)
      const updatedHistory = [...objectHistory, { x, y, t }];
      return { ...prevData, [id]: updatedHistory };
    });
  };

  const handleSceneChange = (example) => {
    setCurrentScene(example);
    setMotionData({}); // Reset motion data for new scene
  };

  const updateConversation = useCallback((newConversation) => {
    setConversationHistory(newConversation);
  }, []);


  return (
    <div className="main">
      <TopMenu/>
      {/* Outer Panel Group (Optional if only one main group) */}
      <PanelGroup direction="vertical">
        {/* Main content Panel */}
        <Panel className="main-panel" defaultSize={90}>
          {/* Horizontal group for the different sections */}
          <PanelGroup direction="horizontal">
            {/* Scene Selector Panel */}
            <Panel className="component-section examples-panel" defaultSize={20} minSize={15}>
              <SceneSelector
                currentScene={currentScene}
                onSceneChange={handleSceneChange}
                conversationHistory={conversationHistory}
              />
            </Panel>
            <PanelResizeHandle className="resize-handle" />

            {/* Visualizer Panel */}
            <Panel className="visualization-section" defaultSize={35} minSize={20}>
              {/* Use content-section class for consistent styling/layout */}
              <div className="content-section">
                <Visualizer
                  key={currentScene.id} // Ensure visualizer remounts on scene change
                  scene={currentScene}
                  onPositionUpdate={handlePositionUpdate}
                />
              </div>
            </Panel>
            <PanelResizeHandle className="resize-handle" />

            {/* Graph Panel */}
            <Panel className="graph-section" defaultSize={25} minSize={15}>
              {/* Use content-section class which provides flex column layout and height */}
              {/* The Graph component itself handles filling this container */}
              <div className="content-section">
                <Graph data={motionData} />
              </div>
            </Panel>
            <PanelResizeHandle className="resize-handle" />

            {/* Conversation Panel */}
            <Panel className="solution-section" defaultSize={20} minSize={15}>
              {/* Use content-section class */}
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