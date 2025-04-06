import React, { useState, useEffect, useRef } from 'react';
import './Conversation.css';

function Conversation({
  updateConversation,
  conversationHistory = [],
  initialMessage = "Hello! How can I help you with physics today?"
}) {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini");

  // Load API key from environment variable
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      updateConversation([{ role: 'ai', content: initialMessage }]);
      hasInitialized.current = true;
    }
  }, [initialMessage, updateConversation]);

  const maxContextLength = 10;

  const handleProcess = async (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput) {
      alert("Please enter a question.");
      return;
    }
    updateConversation(prev => [...prev, { role: 'user', content: trimmedInput }]);
    setInput("");
    setIsProcessing(true);

    let aiResponse = "I couldn't process that.";
    try {
      if (selectedModel === "gemini") {
        if (!API_KEY) {
          aiResponse = "API key is missing. Please configure it.";
        } else {
          console.log("🔁 Trying Gemini API with API Key...");
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{ parts: [{ text: trimmedInput }] }],
              }),
            }
          );
          if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API Error:", errorText);
            throw new Error(`Gemini HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          console.log("Gemini API Response:", JSON.stringify(data, null, 2));
          aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || aiResponse;
        }
      }
      updateConversation(prev => [...prev, { role: 'ai', content: aiResponse }]);
    } catch (error) {
      console.error(`❌ Model failed: ${error.message}`);
      updateConversation(prev => [...prev, {
        role: 'ai',
        content: "Error: No models responded. Ensure API setup is correct.",
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const displayConversation = conversationHistory
    .slice(-maxContextLength)
    .map((msg, index) => (
      <div key={index} className={msg.role === 'ai' ? 'ai-message' : 'user-message'}>
        <p><strong>{msg.role === 'ai' ? 'AI:' : 'You:'}</strong> {msg.content}</p>
      </div>
    ));

  return (
    <div className="conversation-container">
      <div className="model-selector">
        <label htmlFor="model-select">Select Model: </label>
        <select
          id="model-select"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          disabled={isProcessing}
        >
          <option value="gemini">Gemini (Google AI Studio)</option>
          <option value="chatgpt">ChatGPT (Puppeteer)</option>
          <option value="ollama">Ollama</option>
        </select>
      </div>
      <div className="conversation-box">{displayConversation}</div>
      <form className="input-section" onSubmit={handleProcess}>
        <textarea
          className="input-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your physics question..."
          disabled={isProcessing}
        />
        <button
          type="submit"
          className="process-button"
          disabled={isProcessing || !input.trim()}
        >
          {isProcessing ? "Processing..." : "Process"}
        </button>
      </form>
    </div>
  );
}

export default Conversation;