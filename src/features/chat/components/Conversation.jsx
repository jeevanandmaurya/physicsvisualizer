import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import GeminiAIManager from '../../../core/ai/gemini';
import ScenePatcher from '../../../core/scene/patcher';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import './Conversation.css';

function Conversation({
  updateConversation,
  conversationHistory,
  initialMessage,
  currentScene,
  onSceneUpdate,
  chatId
}) {
  const { linkSceneToChat, updateCurrentScene } = useWorkspace();
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

  // Update messages when conversationHistory changes or scene switches
  useEffect(() => {
    if (conversationHistory && conversationHistory.length > 0) {
      setMessages(conversationHistory);
    } else {
      setMessages([{
        id: Date.now(),
        text: initialMessage || "Hello! I'm a Physics AI Agent. I can help you with physics questions and also discuss how to represent described scenes in a 3D visualizer JSON format. How can I assist you with physics today?",
        isUser: false,
        timestamp: new Date(),
        sceneId: currentScene?.id
      }]);
    }
  }, [conversationHistory, initialMessage]);

  // Handle scene switching - reset chat for new scenes
  const prevSceneIdRef = useRef(currentScene?.id);
  useEffect(() => {
    if (prevSceneIdRef.current !== currentScene?.id) {
      console.log(`🔄 Scene switched from ${prevSceneIdRef.current} to ${currentScene?.id}, resetting chat`);
      setMessages([{
        id: Date.now(),
        text: initialMessage || "Hello! I'm a Physics AI Agent. I can help you with physics questions and also simulate scenes in a 3D visualizer.",
        isUser: false,
        timestamp: new Date(),
        sceneId: currentScene?.id
      }]);
      prevSceneIdRef.current = currentScene?.id;
    }
  }, [currentScene?.id, initialMessage]);

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

    if (updateConversation) {
      updateConversation(newMessages);
    }

    setIsLoading(true);

    try {
      const chatContext = {
        history: messages,
        currentMessage: userMessage
      };

      const sceneContext = currentScene ? {
        id: currentScene.id,
        name: currentScene.name,
        description: currentScene.description,
        objects: currentScene.objects?.map(obj => ({
          id: obj.id,
          type: obj.type,
          position: obj.position,
          velocity: obj.velocity,
          mass: obj.mass,
          radius: obj.radius,
          dimensions: obj.dimensions,
          color: obj.color,
          isStatic: obj.isStatic,
          rotation: obj.rotation
        })) || [],
        gravity: currentScene.gravity,
        hasGround: currentScene.hasGround,
        contactMaterial: currentScene.contactMaterial,
        backgroundColor: currentScene.backgroundColor,
        lighting: currentScene.lighting,
        camera: currentScene.camera
      } : null;

      const aiResponse = await aiManager.current.processUserMessage(
        userMessage.text,
        chatContext,
        sceneContext
      );

      let sceneUpdateError = null;
      if (aiResponse.sceneModifications && aiResponse.sceneModifications.length > 0) {
        console.log('AI Scene Update Detected');
        console.log('Applying', aiResponse.sceneModifications.length, 'modifications');

        if (chatId && currentScene?.id) {
          linkSceneToChat(currentScene.id, chatId);
          console.log(`🔗 Linked scene ${currentScene.id} to chat ${chatId}`);
        }

        try {
          const patchResult = scenePatcher.current.applyPatches(currentScene, aiResponse.sceneModifications);

          if (patchResult.success) {
            console.log(`✅ Successfully applied ${patchResult.appliedPatches}/${patchResult.totalPatches} patches`);
            updateCurrentScene(patchResult.scene);
          } else {
            console.error('❌ Failed to apply scene patches:', patchResult.error);
            sceneUpdateError = `⚠️ I tried to modify the scene, but encountered an error: ${patchResult.error}`;
          }
        } catch (error) {
          console.error('❌ Exception applying scene patches:', error);
          sceneUpdateError = `⚠️ I tried to modify the scene, but encountered an unexpected error.`;
        }
      } else {
        console.log('No scene modifications detected in AI response');
      }

      const aiMessage = {
        id: Date.now() + 1,
        text: sceneUpdateError ? `${aiResponse.text}\n\n${sceneUpdateError}` : aiResponse.text,
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
    <>
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
    </>
  );
}

export default Conversation;
