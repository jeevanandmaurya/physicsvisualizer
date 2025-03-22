import React, { useState, useRef } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import Visualizer from './Visualizer';
import Graph from './Graph';
import { scenes } from './scenes';
import './App.css';

function App() {
  const [input, setInput] = useState("");
  const [currentScene, setCurrentScene] = useState('projectileMotion');
  const [conversation, setConversation] = useState([
    { role: 'ai', content: "Hello! How can I help you with physics today?" }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [motionData, setMotionData] = useState([]);
  const solutionRef = useRef(null);

  const handlePositionUpdate = (position) => {
    const newData = [...motionData, position].slice(-100); // Keep last 100 points
    console.log('Motion data updated:', newData); // Debug
    setMotionData(newData);
  };

  const handleProcess = async (e) => {
    e.preventDefault();
    if (input.trim() === "") {
      alert("Please enter a question.");
      return;
    }
    setInput("");
    setIsProcessing(true);
    setConversation(prev => [...prev, { role: 'user', content: input }]);
    
    // Simplified AI response for debugging
    setConversation(prev => [...prev, { role: 'ai', content: "AI response placeholder" }]);
    setIsProcessing(false);
  };

  const maxContextLength = 10;
  const displayConversation = conversation.slice(-maxContextLength).map((msg, index) => (
    <div key={index} className={msg.role === 'ai' ? 'ai-message' : 'user-message'}>
      <p>{msg.role === 'ai' ? 'AI:' : 'You:'} {msg.content}</p>
    </div>
  ));

  return (
    <div className="main" style={{ height: '100vh' }}>
      <header>
        <div>Physics Visualizer</div>
        <select 
          className="scene-selector"
          onChange={(e) => setCurrentScene(e.target.value)}
          value={currentScene}
        >
          {Object.keys(scenes).map((key) => (
            <option key={key} value={key}>{scenes[key].name}</option>
          ))}
        </select>
      </header>
      <PanelGroup direction="vertical">
        <Panel className="main-panel" defaultSize={90}>
          <PanelGroup direction="horizontal">
            <Panel className="component-section" defaultSize={15}>
              <div className="content-section">
                <h2>Objects</h2>
                <div className="physics-parameters">
                  <h3>{scenes[currentScene].name}</h3>
                  <div className="physics-object">
                    <h4>{scenes[currentScene].objects[0].type}</h4>
                    <ul>
                      <li>Mass: {scenes[currentScene].objects[0].mass} kg</li>
                      <li>Radius: {scenes[currentScene].objects[0].radius} m</li>
                      <li>Initial Velocity: [{scenes[currentScene].objects[0].velocity.join(", ")}] m/s</li>
                    </ul>
                  </div>
                  <div className="physics-environment">
                    <h4>Environment</h4>
                    <ul>
                      <li>Gravity: [{scenes[currentScene].gravity.join(", ")}] m/s²</li>
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
                    scene={scenes[currentScene]} 
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
                <div className="conversation-box">{displayConversation}</div>
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
        <PanelResizeHandle className="resize-handle-horizontal" />
        <Panel className="input-section" defaultSize={10} maxSize={50}>
          <div className="input-content">
            <textarea
              className="input-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your physics question..."
            />
            <button
              className="process-button"
              onClick={handleProcess}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Process"}
            </button>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default App;