import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus } from 'lucide-react';
import GeminiAIManager from '../core/ai/gemini';
import ScenePatcher from '../core/scene/patcher';
import './Conversation.css';

function Conversation({
  updateConversation,
  conversationHistory,
  initialMessage,
  currentScene,
  onSceneSwitch,
  onNewChat,
  onSceneUpdate, // New prop for AI scene modifications
  onPendingChanges, // Callback to set pending changes in parent
  onPreviewMode // Callback to set preview mode in parent
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
  const aiManager = useRef(new GeminiAIManager());
  const scenePatcher = useRef(new ScenePatcher());

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
        id: Date.now(), // Use timestamp to ensure unique key
        text: initialMessage || "Hello! I'm a Physics AI Agent. I can help you with physics questions and also discuss how to represent described scenes in a 3D visualizer JSON format. How can I assist you with physics today?",
        isUser: false,
        timestamp: new Date(),
        sceneId: currentScene?.id
      }]);
    }
  }, [conversationHistory, initialMessage, currentScene?.id]);

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

    try {
      // Get AI response with full context
      const chatContext = {
        history: messages,
        currentMessage: userMessage
      };

      const sceneContext = currentScene ? {
        id: currentScene.id,
        name: currentScene.name,
        objects: currentScene.objects?.map(obj => ({
          id: obj.id,
          type: obj.type,
          position: obj.position,
          mass: obj.mass
        })) || [],
        gravity: currentScene.gravity,
        hasGround: currentScene.hasGround
      } : null;

      const aiResponse = await aiManager.current.processUserMessage(
        userMessage.text,
        chatContext,
        sceneContext
      );

      // Handle scene modifications if AI provided any
      if (aiResponse.metadata?.mode === 'generation' && aiResponse.updatedScene) {
        console.log('🎨 AI Scene Generation Detected');
        console.log('Replacing current scene with generated scene');

        // For generation, directly update the scene
        if (onSceneUpdate) {
          onSceneUpdate(aiResponse.updatedScene);
        }
        console.log('✅ Successfully generated and loaded new scene');
      } else if (aiResponse.sceneModifications && aiResponse.sceneModifications.length > 0) {
        console.log('🔧 AI Scene Modification Detected');
        console.log('Applying', aiResponse.sceneModifications.length, 'modifications');

        // Pass changes to parent for preview
        if (onPendingChanges) {
          onPendingChanges(aiResponse.sceneModifications);
        }
        if (onPreviewMode) {
          onPreviewMode(true);
        }
        console.log(`📋 Showing preview for ${aiResponse.sceneModifications.length} changes`);
      } else {
        console.log('💬 No scene modifications detected in AI response');
      }

      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponse.text,
        isUser: false,
        timestamp: new Date(),
        sceneId: currentScene?.id,
        aiMetadata: aiResponse.metadata
      };

      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);

      if (updateConversation) {
        updateConversation(updatedMessages);
      }

    } catch (error) {
      console.error('AI Error:', error);

      // Fallback response
      const fallbackMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble connecting to my AI service right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
        sceneId: currentScene?.id
      };

      const updatedMessages = [...newMessages, fallbackMessage];
      setMessages(updatedMessages);

      if (updateConversation) {
        updateConversation(updatedMessages);
      }
    } finally {
      setIsLoading(false);
    }
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
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Conversation;
