import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import './Conversation.css';
import agentPrompt from '../prompts/agentPrompt.txt?raw'; // Import raw text

const MessageContent = ({ content }) => {
  return <span>{content}</span>;
};

function Conversation({
  updateConversation,
  conversationHistory = [],
  initialMessage = "Hello! I'm a Physics AI Agent. I can help you with physics questions and also discuss how to represent described scenes Jarvis and the Jolly Green Giant in a 3D visualizer JSON format. How can I assist you with physics today?"
}) {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini");
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const hasInitialized = useRef(false);
  const conversationBoxRef = useRef(null);

  useEffect(() => {
    if (!hasInitialized.current && conversationHistory.length === 0) {
      updateConversation([{ role: 'ai', content: initialMessage }]);
      hasInitialized.current = true;
    }
  }, [initialMessage, updateConversation, conversationHistory.length]);

  // Auto-scroll to bottom when new messages are added or content streams in. This works well.
  useEffect(() => {
    if (conversationBoxRef.current) {
      conversationBoxRef.current.scrollTop = conversationBoxRef.current.scrollHeight;
    }
  }, [conversationHistory]);

  const maxContextLength = 10;

  const handleGeminiStream = async (historyForAPI) => {
    const geminiContents = historyForAPI.map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const requestBody = {
      contents: geminiContents,
      systemInstruction: { parts: [{ text: agentPrompt }] },
    };
    
    // FIX: Using a valid and recent model name. 'gemini-1.5-flash-latest' is great for chat.
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini HTTP error! Status: ${response.status} - ${errorText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedContent = "";
    let buffer = ""; // FIX: Buffer for robust stream parsing

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Add the new chunk to the buffer
      buffer += decoder.decode(value, { stream: true });
      // Split buffer by newlines, but keep the last (potentially incomplete) line
      const lines = buffer.split('\n');
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.substring(6).trim();
          if (!jsonStr || jsonStr === '[DONE]') continue;
          
          try {
            const jsonData = JSON.parse(jsonStr);
            const newText = jsonData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (newText) {
              accumulatedContent += newText;
              // Update the last message in the conversation array
              updateConversation(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'ai', content: accumulatedContent, isStreaming: true };
                return updated;
              });
            }
          } catch (e) {
            console.warn('⚠️ Failed to parse Gemini streaming chunk:', jsonStr, e);
          }
        }
      }
    }
  };

  const handleOllamaStream = async (historyForAPI) => {
    // FIX: Convert conversation history to the format Ollama's /api/chat expects
    const ollamaMessages = historyForAPI.map(msg => ({
      role: msg.role === 'ai' ? 'assistant' : 'user',
      content: msg.content,
    }));

    const models = ['gemma2', 'llama3']; // Recommended models
    let success = false;
    
    for (const model of models) {
      try {
        console.log(`🔁 Trying Ollama model: ${model}`);
        // FIX: Using the correct '/api/chat' endpoint to maintain conversation context
        const response = await fetch('http://localhost:11434/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            messages: ollamaMessages,
            stream: true,
            system: agentPrompt, // Pass system prompt directly
          }),
        });

        if (!response.ok) throw new Error(`Ollama responded with status ${response.status}`);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = "";
        let buffer = ""; // FIX: Buffer for robust stream parsing

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const jsonData = JSON.parse(line);
              // FIX: The /api/chat response format is different
              const newText = jsonData.message?.content;
              if (newText) {
                accumulatedContent += newText;
                updateConversation(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'ai', content: accumulatedContent, isStreaming: true };
                  return updated;
                });
              }
            } catch (e) {
              console.warn('⚠️ Failed to parse Ollama streaming chunk:', line, e);
            }
          }
        }
        success = true;
        break; // Success, so exit the model-trying loop
      } catch (error) {
        console.warn(`❌ Failed with Ollama ${model}: ${error.message}`);
      }
    }
    if (!success) {
      throw new Error("All Ollama models failed. Is Ollama running with 'gemma2' or 'llama3' installed?");
    }
  };

  const handleProcess = async (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const userMessage = { role: 'user', content: trimmedInput };
    // This is the full history that will be sent to the API
    const historyForAPI = [...conversationHistory.slice(-maxContextLength), userMessage];

    // Update UI with user message and an empty AI placeholder for the stream
    updateConversation(prev => [...prev, userMessage, { role: 'ai', content: "", isStreaming: true }]);
    
    setInput("");
    setIsProcessing(true);

    try {
      if (selectedModel === "ollama") {
        // FIX: Pass the full history, not just the last prompt
        await handleOllamaStream(historyForAPI);
      } else if (selectedModel === "gemini") {
        if (!GEMINI_API_KEY) {
          throw new Error("Gemini API key is missing. Please set VITE_GEMINI_API_KEY in your .env file.");
        }
        await handleGeminiStream(historyForAPI);
      }
    } catch (error) {
      console.error(`❌ ${selectedModel} failed:`, error);
      // FIX: Better error handling. Update the placeholder with the error message.
      updateConversation(prev => {
        const updated = [...prev];
        const lastMessage = updated[updated.length - 1];
        if (lastMessage && lastMessage.role === 'ai') {
          lastMessage.content = `Error: ${error.message}`;
          lastMessage.isStreaming = false; // Stop the blinking cursor
        }
        return updated;
      });
    } finally {
      // Finalize the message: remove the streaming indicator from the last message
      updateConversation(prev => {
        const updated = [...prev];
        const lastMessage = updated[updated.length - 1];
        if (lastMessage && lastMessage.role === 'ai') {
          lastMessage.isStreaming = false;
        }
        return updated;
      });
      setIsProcessing(false);
    }
  };

  const displayConversation = conversationHistory.map((msg, index) => (
    <div key={index} className={msg.role === 'ai' ? 'ai-message' : 'user-message'}>
      <strong>{msg.role === 'ai' ? 'AI:' : 'You:'}</strong>
      {' '}
      <MessageContent content={msg.content} />
      {msg.isStreaming && <span className="streaming-indicator">▋</span>}
    </div>
  ));

  return (
    <div className="conversation-container">
      <div className="conversation-header">
        <label htmlFor="model-select">Model:</label>
        <select
          id="model-select"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          disabled={isProcessing}
          className="model-selector"
        >
          <option value="gemini">Gemini</option>
          <option value="ollama">Ollama</option>
        </select>
      </div>
      
      <div className="conversation-box" ref={conversationBoxRef}>
        {displayConversation}
      </div>
      
      <div className="input-section">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your physics question..."
          disabled={isProcessing}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleProcess(e);
            }
          }}
          className="input-textarea"
          rows={1}
        />
        <button
          onClick={handleProcess}
          disabled={isProcessing || !input.trim()}
          className="process-button"
          title={isProcessing ? "Processing..." : "Send message"}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

export default Conversation;