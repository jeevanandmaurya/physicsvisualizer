import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus } from 'lucide-react';
import './Conversation.css';

function Conversation({
  updateConversation,
  conversationHistory,
  initialMessage,
  currentScene,
  onSceneSwitch,
  onNewChat
}) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: initialMessage || "Hello! I'm a Physics AI Agent. I can help you with physics questions and also discuss how to represent described scenes in a 3D visualizer JSON format. How can I assist you with physics today?",
      isUser: false,
      timestamp: new Date(),
      sceneId: currentScene?.id
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update messages when conversationHistory changes (but not when scene changes)
  useEffect(() => {
    if (conversationHistory && conversationHistory.length > 0) {
      // Show all messages from the chat, regardless of scene
      setMessages(conversationHistory);
    } else {
      // If no conversation history, show initial message
      setMessages([{
        id: 1,
        text: initialMessage || "Hello! I'm a Physics AI Agent. I can help you with physics questions and also discuss how to represent described scenes in a 3D visualizer JSON format. How can I assist you with physics today?",
        isUser: false,
        timestamp: new Date(),
        sceneId: currentScene?.id
      }]);
    }
  }, [conversationHistory, initialMessage]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: input.trim(),
      isUser: true,
      timestamp: new Date(),
      sceneId: currentScene?.id
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    // Update parent component
    if (updateConversation) {
      updateConversation(newMessages);
    }

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        text: `I understand you're asking about: "${userMessage.text}". This is a placeholder response. In a real implementation, you would connect this to your AI service.`,
        isUser: false,
        timestamp: new Date(),
        sceneId: currentScene?.id
      };
      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);

      if (updateConversation) {
        updateConversation(updatedMessages);
      }

      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <h3>Chat</h3>
        {onNewChat && (
          <button
            onClick={onNewChat}
            className="new-chat-btn"
            title="Start New Chat"
          >
            <Plus size={16} />
            New Chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.isUser ? 'user' : 'ai'}`}
          >
            <div className="message-content">
              <div className="message-text">{message.text}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message ai">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input">
        <div className="input-container">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask anything..."
            disabled={isLoading}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="send-btn"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Conversation;
