// App.jsx
import React, { useState } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import Visualizer from './Visualizer';
import Graph from './Graph';
import Conversation from './Conversation';
import SceneSelector from './SceneSelector'; // Import the new component
import './App.css';
import { mechanicsExamples } from './scenes.js'; // Correct path assuming scenes.js is in the same directory

function App() {
  const [currentScene, setCurrentScene] = useState(mechanicsExamples[0]);
  const [motionData, setMotionData] = useState({});

  const handlePositionUpdate = (posDataWithId) => {
    const { id, x, y, z, t } = posDataWithId; // Include z if needed, Graph uses x, y, t
    setMotionData((prevData) => {
      const objectHistory = prevData[id] || [];
      // *** REMOVED .slice(-100) to keep all data ***
      const updatedHistory = [...objectHistory, { x, y, t }]; // Only store x, y, t needed by Graph
      return { ...prevData, [id]: updatedHistory };
    });
  };

  const handleSceneChange = (example) => {
    setCurrentScene(example);
    setMotionData({}); // Reset motion data when scene changes (essential!)
  };

  return (
    <div className="main">
      <PanelGroup direction="vertical">
        <Panel className="main-panel" defaultSize={90}>
          <PanelGroup direction="horizontal">
            {/* Left Panel: Scene Selector */}
            <Panel className="component-section examples-panel" defaultSize={20} minSize={15}>
              <SceneSelector
                currentScene={currentScene}
                onSceneChange={handleSceneChange}
              />
            </Panel>
            <PanelResizeHandle className="resize-handle" />
            {/* Middle Panel: Visualization */}
            <Panel className="visualization-section" defaultSize={35} minSize={20}>
              <div className="content-section">
                <Visualizer
                  key={currentScene.id} // Key ensures remount on scene change
                  scene={currentScene}
                  onPositionUpdate={handlePositionUpdate}
                />
              </div>
            </Panel>
            <PanelResizeHandle className="resize-handle" />
            {/* Right Panel 1: Graph */}
            <Panel className="graph-section" defaultSize={25} minSize={15}>
              {/* Wrap Graph in a container that allows space for controls below */}
              <div className="content-section" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Graph data={motionData} />
              </div>
            </Panel>
            <PanelResizeHandle className="resize-handle" />
            {/* Right Panel 2: Conversation */}
            <Panel className="solution-section" defaultSize={20} minSize={15}>
              <div className="content-section">
                <Conversation />
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default App;