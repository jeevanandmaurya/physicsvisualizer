import React, { useState } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import './App.css';

function App() {
  const [input, setInput] = useState("");
  const [solution, setSolution] = useState("AI: Hello! How can I help you with physics today?");
  const [isProcessing,setIsProcessing] = useState(false);

  const handleProcess = async (e) => {
    e.preventDefault();
    if (input.trim() === "") {
      alert("Please enter a question.");
      return;
    }

    //User Input
    setIsProcessing(true);
    setSolution(prev => prev +`\nYou: ${input}`);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    //Ai Output
    setSolution(prev => prev +'\nAI: '+'I don\'t understand your question. Can you clarify?')

    setIsProcessing(false);
    setInput("");

  };




  return (
    <div className="main">
      <PanelGroup direction="vertical">
        <Panel className="main-panel" defaultSize={90}>
          <PanelGroup direction="horizontal">
            {/* Component Section */}
            <Panel className="component-section" defaultSize={15}>
              <div className="content-section">
                <h2>Component List</h2>
                <ul>
                  <li>Block</li>
                  <li>Inclined Plane</li>
                  <li>Pulley</li>
                  <li>Spring</li>
                  <li>Ball</li>
                </ul>
              </div>
            </Panel>
            <PanelResizeHandle className="resize-handle" />
            {/* 3D Visualization Section */}
            <Panel className="visualization-section" defaultSize={30}>
              <div className="content-section">
                <h2>3D/2D Visualization</h2>
                <p>Scene/Visualization of the given Problem...</p>
     
              </div>
            </Panel>
            <PanelResizeHandle className="resize-handle" />

            {/* Graphing Section */}
            <Panel className="graph-section" defaultSize={30}>
              <div className="content-section">
         
                <h2>Graph</h2>
                <div id="jsxgraph-board"></div>
              </div>
            </Panel>
            <PanelResizeHandle className="resize-handle" />
            {/* Soultion Section */}
            <Panel className="solution-section" defaultSize={25}>
              <div className="content-section">
          
                <h2>AI Solution</h2>
                <pre>{solution}</pre>
              </div>
            </Panel>
          </PanelGroup>
        </Panel>

        <PanelResizeHandle className="resize-handle-horizontal" />
        {/* Input Section */}
        <Panel className="input-section" defaultSize={10} maxSize={50}>
          <div className="input-content">
            <textarea
              className="input-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your physics question..."
            />
            <button className="process-button" onClick={handleProcess}>
            {isProcessing?"Processing...":"Process"}
            </button>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default App;