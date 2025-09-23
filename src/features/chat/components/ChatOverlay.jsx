import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Send } from 'lucide-react';
import GeminiAIManager from '../../../core/ai/gemini';
import ScenePatcher from '../../../core/scene/patcher';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import './ChatOverlay.css';

const ChatOverlay = ({
  isOpen,
  onToggle,
  messages,
  addMessage,
  scene,
  getChatForScene,
  onSceneUpdate
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [previousPosition, setPreviousPosition] = useState({ x: 100, y: 100 });
  const [previousSize, setPreviousSize] = useState({ width: 800, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const overlayRef = useRef(null);
  const messagesEndRef = useRef(null);
  const aiManager = useRef(new GeminiAIManager());
  const scenePatcher = useRef(new ScenePatcher());

  const currentChatId = scene?.id ? getChatForScene(scene.id) : null;
  const { linkSceneToChat, updateCurrentScene } = useWorkspace();

  // Conversation state
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm a Physics AI Agent. I can help you with physics questions and also discuss how to represent described scenes in a 3D visualizer JSON format. How can I assist you with physics today?",
      isUser: false,
      timestamp: new Date(),
      sceneId: scene?.id
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Update messages when conversationHistory changes
  useEffect(() => {
    if (messages && messages.length > 0) {
      setChatMessages(messages);
    } else {
      setChatMessages([{
        id: Date.now(),
        text: "Hello! I'm a Physics AI Agent. I can help you with physics questions and also discuss how to represent described scenes in a 3D visualizer JSON format. How can I assist you with physics today?",
        isUser: false,
        timestamp: new Date(),
        sceneId: scene?.id
      }]);
    }
  }, [messages]);

  // Handle scene switching - reset chat for new scenes
  const prevSceneIdRef = useRef(scene?.id);
  useEffect(() => {
    if (prevSceneIdRef.current !== scene?.id) {
      console.log(`🔄 Scene switched from ${prevSceneIdRef.current} to ${scene?.id}, resetting chat`);
      setChatMessages([{
        id: Date.now(),
        text: "Hello! I'm a Physics AI Agent. I can help you with physics questions and also simulate scenes in a 3D visualizer.",
        isUser: false,
        timestamp: new Date(),
        sceneId: scene?.id
      }]);
      prevSceneIdRef.current = scene?.id;
    }
  }, [scene?.id]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: input.trim(),
      isUser: true,
      timestamp: new Date(),
      sceneId: scene?.id
    };

    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    setInput('');

    setIsLoading(true);

    try {
      const chatContext = {
        history: chatMessages,
        currentMessage: userMessage
      };

      const sceneContext = scene ? {
        id: scene.id,
        name: scene.name,
        description: scene.description,
        objects: scene.objects?.map(obj => ({
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
        gravity: scene.gravity,
        hasGround: scene.hasGround,
        contactMaterial: scene.contactMaterial,
        backgroundColor: scene.backgroundColor,
        lighting: scene.lighting,
        camera: scene.camera
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

        if (currentChatId && scene?.id) {
          linkSceneToChat(scene.id, currentChatId);
          console.log(`🔗 Linked scene ${scene.id} to chat ${currentChatId}`);
        }

        try {
          const patchResult = scenePatcher.current.applyPatches(scene, aiResponse.sceneModifications);

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
        sceneId: scene?.id,
        aiMetadata: aiResponse.metadata
      };

      const updatedMessages = [...newMessages, aiMessage];
      setChatMessages(updatedMessages);

      if (addMessage) {
        addMessage(aiMessage);
      }

    } catch (error) {
      console.error('AI Error:', error);

      const fallbackMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble connecting to my AI service right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
        sceneId: scene?.id
      };

      const updatedMessages = [...newMessages, fallbackMessage];
      setChatMessages(updatedMessages);

      if (addMessage) {
        addMessage(fallbackMessage);
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Handle escape key to close overlay
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onToggle]);

  // Set initial position after mount, centered and above status bar
  useEffect(() => {
    if (isOpen) {
      const centerX = Math.max(48, (window.innerWidth - 400) / 2);
      const centerY = Math.max(0, (window.innerHeight - 300 - 40) / 2);
      setPosition({ x: centerX, y: centerY });
      setSize({ width: 400, height: 300 });
      setPreviousPosition({ x: centerX, y: centerY });
      setPreviousSize({ width: 400, height: 300 });
    }
  }, [isOpen]);

  // Drag functionality - only from header
  const handleMouseDown = (e) => {
    // Only allow dragging from header, not from control buttons or resize handle
    if (e.target.closest('.chat-overlay-control-btn') || e.target.closest('.resize-handle')) return;

    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      let newX = e.clientX - dragStart.x;
      let newY = e.clientY - dragStart.y;

      // Keep within viewport bounds, avoiding activity bar (left ~48px) and status bar (bottom ~40px)
      const activityBarWidth = 48;
      const statusBarHeight = 40;
      const currentWidth = isMinimized ? 90 : Math.max(400, size.width);
      const currentHeight = isMinimized ? 28 : Math.max(300, size.height);
      newX = Math.max(activityBarWidth, Math.min(window.innerWidth - currentWidth, newX));
      newY = Math.max(0, Math.min(window.innerHeight - currentHeight - statusBarHeight, newY));

      setPosition({ x: newX, y: newY });
    } else if (isResizing && !isMinimized) {
      const rect = overlayRef.current.getBoundingClientRect();
      const newWidth = Math.max(400, e.clientX - rect.left);
      const newHeight = Math.max(150, e.clientY - rect.top); // Minimum height to fit header + input area
      setSize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleResizeStart = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY
    });
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, isResizing]);

  if (!isOpen) return null;

  return (
    <div className={`chat-overlay ${isMinimized ? 'minimized' : ''}`}>
      {!isMinimized && <div className="chat-overlay-backdrop" />}
      <div
        className="chat-overlay-container"
        ref={overlayRef}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: isMinimized ? '40px' : `${size.height}px`,
          cursor: isResizing ? 'nw-resize' : 'default'
        }}
      >
        {/* Minimal header with title and controls - draggable */}
        <div
          className="chat-overlay-header"
          onMouseDown={handleMouseDown}
          title={isMinimized ? 'Drag to move. Click to expand.' : 'Drag to move.'}
        >
          <div className="chat-overlay-title">Chat</div>
          <div className="chat-overlay-header-controls">
            <button
              className="chat-overlay-control-btn"
              onClick={() => {
                if (isMinimized) {
                  // Maximize: restore previous
                  setPosition(previousPosition);
                  setSize(previousSize);
                  setIsMinimized(false);
                } else {
                  // Minimize: save current, set compact
                  setPreviousPosition(position);
                  setPreviousSize(size);
                  setPosition({
                    x: (window.innerWidth - 20) / 2, // Horizontally centered
                    y: window.innerHeight - 80 // Above status bar
                  });
                  setSize({ width: 50, height: 8 });
                  setIsMinimized(true);
                }
              }}
              title={isMinimized ? "Maximize" : "Minimize"}
            >
              <FontAwesomeIcon icon={isMinimized ? faChevronUp : faChevronDown} />
            </button>
            <button
              className="chat-overlay-control-btn close-btn"
              onClick={onToggle}
              title="Close (Esc)"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            <div className="chat-overlay-content">
              <div className="chat-container">
                {/* Messages */}
                <div className="chat-messages">
                  {chatMessages.map((message) => (
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
            </div>
            <div
              className="resize-handle"
              onMouseDown={handleResizeStart}
              title="Resize"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatOverlay;
