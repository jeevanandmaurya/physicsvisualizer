import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import './Conversation.css';
import agentPrompt from '../prompts/agentPrompt.txt?raw'; // Import raw text

const MessageContent = ({ content }) => {
  if (typeof content !== 'string') {
    return <>{content}</>;
  }
  const elements = [];
  const regex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(content)) !== null) 
  {
    if (match.index > lastIndex) {
      elements.push(<span key={`text-${lastIndex}`}>{content.substring(lastIndex, match.index)}</span>);
    }
    const matchedPart = match[0];
    let latexToRender = '';
    let isDisplayMode = false;
    if (matchedPart.startsWith('$$') && matchedPart.endsWith('$$')) {
      latexToRender = matchedPart.substring(2, matchedPart.length - 2);
      isDisplayMode = true;
    } else if (matchedPart.startsWith('$') && matchedPart.endsWith('$')) {
      latexToRender = matchedPart.substring(1, matchedPart.length - 1);
      isDisplayMode = false;
    }
    if (latexToRender.trim() !== "") {
      try {
        const html = katex.renderToString(latexToRender, {
          displayMode: isDisplayMode,
          throwOnError: false,
          output: "html",
        });
        elements.push(<span key={`katex-${match.index}`} dangerouslySetInnerHTML={{ __html: html }} />);
      } catch (e) {
        console.error('KaTeX rendering error for:', latexToRender, e);
        elements.push(<span key={`error-${match.index}`}>{matchedPart}</span>);
      }
    } else {
      elements.push(<span key={`empty-${match.index}`}>{matchedPart}</span>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < content.length) {
    elements.push(<span key={`text-${lastIndex}`}>{content.substring(lastIndex)}</span>);
  }
  return <>{elements}</>;
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

  useEffect(() => {
    if (!hasInitialized.current && conversationHistory.length === 0) {
      updateConversation([{ role: 'ai', content: initialMessage }]);
      hasInitialized.current = true;
    }
  }, [initialMessage, updateConversation, conversationHistory.length, selectedModel]);

  const maxContextLength = 10;

  const handleProcess = async (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput) {
      alert("Please enter a question.");
      return;
    }

    const userMessage = { role: 'user', content: trimmedInput };
    updateConversation(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    let aiResponse = "I couldn't process that.";
    try {
      const historyForAPI = [...conversationHistory.slice(-(maxContextLength -1)), userMessage];

      if (selectedModel === "chatgpt") {
        console.log("🔁 Trying ChatGPT via Puppeteer...");
        const response = await fetch('http://localhost:3000/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: trimmedInput }),
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error("ChatGPT Error:", errorText);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        aiResponse = data.response || aiResponse;
      } else if (selectedModel === "ollama") {
        const models = ['gemma3', 'gemma3:1b'];
        let success = false;
        for (const model of models) {
          try {
            console.log(`🔁 Trying Ollama model: ${model}`);
            const response = await fetch('http://localhost:11434/api/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ model, prompt: trimmedInput, stream: false }),
            });
            if (!response.ok) {
              const errorText = await response.text();
              console.error("Ollama Error:", errorText);
              throw new Error(`Ollama HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Ollama Response:", JSON.stringify(data, null, 2));
            aiResponse = data.response || aiResponse;
            success = true;
            break;
          } catch (error) {
            console.warn(`❌ Failed with Ollama ${model}: ${error.message}`);
          }
        }
        if (!success) throw new Error("All Ollama models failed.");
      } else if (selectedModel === "gemini") {
        if (!GEMINI_API_KEY) {
          aiResponse = "Gemini API key is missing. Please configure it.";
        } else {
          console.log("🔁 Trying Gemini API with context and system prompt...");
          const geminiContents = historyForAPI.map(msg => ({
            role: msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.content }],
          }));

          const requestBody = {
            contents: geminiContents,
            systemInstruction: {
              parts: [{ text: agentPrompt }]
            },
          };

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(requestBody),
            }
          );
          if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API Error response text:", errorText);
            let errorJson = {};
            try { errorJson = JSON.parse(errorText); } catch (e) { /* ignore parsing error */ }
            const detail = errorJson.error?.message || errorText;
            throw new Error(`Gemini HTTP error! Status: ${response.status} - ${detail}`);
          }
          const data = await response.json();

          if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            aiResponse = data.candidates[0].content.parts[0].text;
          } else if (data.promptFeedback?.blockReason) {
            aiResponse = `Blocked by API: ${data.promptFeedback.blockReason}. ${data.promptFeedback.blockReasonMessage || ''}`;
            if (data.candidates?.[0]?.finishReason === "SAFETY") {
                 aiResponse += " (Safety block on response candidate)";
            }
            console.warn("Gemini content issue:", data.promptFeedback, data.candidates?.[0]);
          } else {
            aiResponse = "Gemini returned an empty or unexpected response structure.";
            console.warn("Unexpected Gemini response structure:", data);
          }
        }
      }
      updateConversation(prev => [...prev, { role: 'ai', content: aiResponse }]);
    } catch (error) {
      console.error(`❌ Model failed: ${error.message}`);
      updateConversation(prev => [...prev, {
        role: 'ai',
        content: `Error: Model failed. ${error.message}. Ensure setup is correct.`,
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const displayConversation = conversationHistory
    .slice(-maxContextLength * 2)
    .map((msg, index) => (
      <div key={index} className={msg.role === 'ai' ? 'ai-message' : 'user-message'}>
        <strong>{msg.role === 'ai' ? 'AI:' : 'You:'}</strong>
        {' '}
        <MessageContent content={msg.content} />
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
          <option value="chatgpt">ChatGPT</option>
          <option value="ollama">Ollama</option>
        </select>
      </div>
      
      <div className="conversation-box">
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