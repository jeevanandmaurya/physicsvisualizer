import React, { useState } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import './App.css';

function App() {
  const [input, setInput] = useState("");
  // const [solution, setSolution] = useState("AI: Hello! How can I help you with physics today?");
  const [conversation, setConversation] = useState([
    { role: 'ai', content: "Hello! How can I help you with physics today?" }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [metadata, setMetadata] = useState(null);
  

  const handleProcess = async (e) => {
    e.preventDefault();
    if (input.trim() === "") {
      alert("Please enter a question.");
      return;
    }

    setIsProcessing(true);
    // setSolution(prev => prev + `\nYou: ${input}\nAI: `);
    setConversation(prev => [...prev, { role: 'user', content: input }]);

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
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

    // Extracting metadata
    const metadataObj = {
      title: "Physics Question", // Extract this from AI response if needed
      topic: "Mechanics", // Assume mechanics for now, later we'll extract dynamically
      objects: [
        { name: "Block", mass: "10kg", speed: "5m/s" },
        { name: "Inclined Plane", angle: "30 degrees" }
      ],
      time: new Date().toISOString()
    };
    
    setMetadata(metadataObj); // Save metadata of the last conversation


    setInput(""); // Clear textarea
    setIsProcessing(false); // Reset processing state
  };
  // Display Conversation
  const maxContextLength = 10;
  const displayConversation = conversation.slice(-maxContextLength).map((msg, index) => (
    <div key={index} className={msg.role === 'ai' ? 'ai-message' : 'user-message'}>
      <strong>{msg.role === 'ai' ? 'AI:' : 'You:'} </strong>{msg.content}
    </div>
  ));

  return (
    <div className="main">
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
                  <li>Speed-</li>
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
            {isProcessing?"Processing...":"Process"}
            </button>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default App;
