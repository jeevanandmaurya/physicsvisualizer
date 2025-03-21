import React, { useState,useRef } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import Visualizer from './Visualizer';
import Graph from './Graph';
import './App.css';

function App() {
  const [input, setInput] = useState("");
  //const [solution, setSolution] = useState("AI: Hello! How can I help you with physics today?");
  const [conversation, setConversation] = useState([
    { role: 'ai', content: "Hello! How can I help you with physics today?" }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [physicsData, setPhysicsData] = useState([]); // Store physics data
  const solutionRef = useRef(null);


  const handleProcess = async (e) => {
    e.preventDefault();
    if (input.trim() === "") {
      alert("Please enter a question.");
      return;
    }
    setInput(""); // Clear textarea
    
    setIsProcessing(true);
    // setSolution(prev => prev + `\nYou: ${input}\nAI: `);
    setConversation(prev => [...prev, { role: 'user', content: input }]);
    
    // if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      if (1) {
        const models = ['gemma3', 'gemma3:1b']; // PC (4b), Phone (1b)
        let aiResponse = null; // Declare outside loop for scope
        
        for (const model of models) {
          try {
            console.log(`Sending request to Ollama with ${model}...`);
            const response = await fetch('http://localhost:11434/api/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: model,
                prompt: input,
                stream: false,
              }),
            });
            
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(`Raw API Response from ${model}:`, data);
            aiResponse = data.response || "I couldn’t process that.";
            
            // setSolution(prev => prev + aiResponse); // Update solution directly
            setConversation(prev => [...prev, { role: 'ai', content: aiResponse }]);
            break; // Exit on success
          } catch (error) {
            console.warn(`Failed with ${model}: ${error.message}`);
            // Continue to next model
          }
        }
        
        if (!aiResponse) {
          // setSolution(prev => prev + `Error: No available models. Ensure Ollama is running with a model loaded.`);
          setConversation(prev => [...prev, { role: 'ai', content: "Error: No available models. Ensure Ollama is running with a model loaded." }]);
        }
      } else {
        // setSolution(prev => prev + 'Error: Ollama only works locally.');
        setConversation(prev => [...prev, { role: 'ai', content: "Error: Ollama only works locally." }]);
      }
      
      setIsProcessing(false); // Reset processing state

  };
  // Display Conversation
  const maxContextLength = 10;
  const displayConversation = conversation.slice(-maxContextLength).map((msg, index) => (
    <div key={index} className={msg.role === 'ai' ? 'ai-message' : 'user-message'}>
      <p>{msg.role === 'ai' ? 'AI:' : 'You:'}{msg.content}</p>
    </div>
  ));

  return (
    <div className="main">
    <header>
      <div>Physics Visualizer</div>
    </header>
      <PanelGroup direction="vertical">
        <Panel className="main-panel" defaultSize={90}>
          <PanelGroup direction="horizontal">
            {/* Component Section */}
            <Panel className="component-section" defaultSize={15}>
              <div className="content-section">
                <h2>Objects</h2>
                Title-Energy in Sphere due to Motion
                Topic(Mechanics)
                Ball(Sphere)
                <ul>
                  <li>Radius-</li>
                  <li>Mass-</li>
                  <li>Speed</li>
                </ul>

              </div>
            </Panel>
            <PanelResizeHandle className="resize-handle" />
            {/* 3D Visualization Section */}
            <Panel className="visualization-section" defaultSize={30}>
              <div className="content-section">
                <h2>3D/2D Visualization</h2>
                <div style={{ height: 'calc(100% - 40px)' }}>
                  <Visualizer onPhysicsUpdate={setPhysicsData}/>
                </div>
              </div>
            </Panel>
            <PanelResizeHandle className="resize-handle" />

            {/* Graphing Section */}
            <Panel className="graph-section" defaultSize={30}>
              <div className="content-section">

                <h2>Graph</h2>
                <div style={{ height: 'calc(100% - 40px)' }}>
                  <Graph physicsData={physicsData}/>
                </div>
              </div>
            </Panel>
            <PanelResizeHandle className="resize-handle" />
            {/* Soultion Section */}
            <Panel className="solution-section" defaultSize={25}>
              <div className="content-section">

                <h2>AI Solution</h2>
                {/* <p>{solution}</p> */}
                <div className="conversation-box">{displayConversation}</div>
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
            <button className="process-button"
              onClick={handleProcess}
              disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Process"}
            </button>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default App;
