// App.jsx
import React, { useState, useRef } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import Visualizer from './Visualizer';
import Graph from './Graph';
import Conversation from './Conversation';
import './App.css';

function App() {
  const [currentScene, setCurrentScene] = useState({
    name: "Projectile Motion",
    objects: [
      {
        type: "sphere",
        mass: 1,
        radius: 0.5,
        position: [0, 0.5, 0],
        velocity: [1, 10, 0],
        color: "red"
      }
    ],
    gravity: [0, -9.81, 0]
  });
  
  const [motionData, setMotionData] = useState([]);
  const solutionRef = useRef(null);

  const handlePositionUpdate = (position) => {
    const newData = [...motionData, position].slice(-100);
    setMotionData(newData);
    console.log('Ball position:', {
      x: position.x.toFixed(2),
      y: position.y.toFixed(2),
      t: position.t.toFixed(2),
    });
  };

  return (
    <div className="main">
      <header>
        <div>Physics Visualizer</div>
      </header>
      <PanelGroup direction="vertical">
        <Panel className="main-panel" defaultSize={90}>
          <PanelGroup direction="horizontal">
            <Panel className="component-section" defaultSize={15}>
              <div className="content-section">
                <h2>Objects</h2>
                <div className="physics-parameters">
                  <h3>{currentScene.name}</h3>
                  <div className="physics-object">
                    <h4>{currentScene.objects[0].type}</h4>
                    <ul>
                      <li>Mass: {currentScene.objects[0].mass} kg</li>
                      <li>Radius: {currentScene.objects[0].radius} m</li>
                      <li>Initial Velocity: [{currentScene.objects[0].velocity.join(", ")}] m/s</li>
                    </ul>
                  </div>
                  <div className="physics-environment">
                    <h4>Environment</h4>
                    <ul>
                      <li>Gravity: [{currentScene.gravity.join(", ")}] m/s²</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Panel>
            <PanelResizeHandle className="resize-handle" />
            
            <Panel className="visualization-section" defaultSize={30}>
              <div className="content-section">
                <h2>3D/2D Visualization</h2>
                <div style={{ height: 'calc(100% - 40px)' }}>
                  <Visualizer 
                    scene={currentScene} 
                    onPositionUpdate={handlePositionUpdate}
                  />
                </div>
              </div>
            </Panel>
            <PanelResizeHandle className="resize-handle" />

            <Panel className="graph-section" defaultSize={30}>
              <div className="content-section">
                <h2>Graph</h2>
                <div style={{ height: 'calc(100% - 40px)' }}>
                  <Graph data={motionData} />
                </div>
              </div>
            </Panel>
            <PanelResizeHandle className="resize-handle" />
            
            <Panel className="solution-section" defaultSize={25}>
              <div className="content-section">
                <h2>AI Solution</h2>
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