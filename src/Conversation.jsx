// Conversation.jsx
import React, { useState, useEffect } from 'react';
import './Conversation.css'; // You'll need to create this CSS file

function Conversation({ initialMessage = "Hello! How can I help you with physics today?" }) {
  const [conversation, setConversation] = useState([
    { role: 'ai', content: initialMessage }
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const maxContextLength = 10;

  const handleProcess = async (e) => {
    e.preventDefault();
    if (input.trim() === "") {
      alert("Please enter a question.");
      return;
    }
    
    setConversation(prev => [...prev, { role: 'user', content: input }]);
    setInput("");
    setIsProcessing(true);

    const models = ['gemma3', 'gemma3:1b'];
    let aiResponse = null;

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
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        aiResponse = data.response || "I couldn't process that.";
        setConversation(prev => [...prev, { role: 'ai', content: aiResponse }]);
        break;
      } catch (error) {
        console.warn(`Failed with ${model}: ${error.message}`);
      }
    }

    if (!aiResponse) {
      setConversation(prev => [...prev, { 
        role: 'ai', 
        content: "Error: No available models. Ensure Ollama is running with a model loaded." 
      }]);
    }
    
    setIsProcessing(false);
  };

  const displayConversation = conversation.slice(-maxContextLength).map((msg, index) => (
    <div key={index} className={msg.role === 'ai' ? 'ai-message' : 'user-message'}>
      <p>{msg.role === 'ai' ? 'AI:' : 'You:'} {msg.content}</p>
    </div>
  ));

  return (
    <div className="conversation-container">
      <div className="conversation-box">
        {displayConversation}
      </div>
      <div className="input-section">
        <textarea
          className="input-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your physics question..."
          disabled={isProcessing}
        />
        <button
          className="process-button"
          onClick={handleProcess}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Process"}
        </button>
      </div>
    </div>
  );
}

export default Conversation;