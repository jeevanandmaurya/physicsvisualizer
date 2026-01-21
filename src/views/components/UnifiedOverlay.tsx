/**
 * UnifiedOverlay - Draggable/Resizable wrapper for ChatView
 * Reuses ChatView component for consistency
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Rnd } from 'react-rnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faTimes, faComments } from '@fortawesome/free-solid-svg-icons';
import { ChevronRight } from 'lucide-react';
import { useOverlay } from '../../contexts/OverlayContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useConversation } from '../../ui-logic/chat/Conversation';
import { ChatSidebar } from '../components/chat/ChatSidebar';
import { ChatInput } from '../components/chat/ChatInput';
import { MessageList } from '../components/chat/MessageList';
import { loadExampleScene } from '../../utils/exampleScenes';
import './UnifiedOverlay.css';
import '../ChatView.css';

// Stable empty array reference to prevent re-renders
const EMPTY_MESSAGES: any[] = [];

interface UnifiedOverlayProps {
  isOpen: boolean;
  onToggle: () => void;
  scene: any;
  onSceneUpdate: (updates: any) => void;
}

export const UnifiedOverlay: React.FC<UnifiedOverlayProps> = ({
  isOpen,
  onToggle,
  scene: _scene,
  onSceneUpdate: _onSceneUpdate
}) => {
  const { getZIndex, focusOverlay, isMinimized: isOverlayMinimized, toggleMinimize, registerOverlay, unregisterOverlay } = useOverlay();
  const { overlayOpacity } = useTheme();
  const {
    getChatOverlayCurrentChat,
    setChatOverlayCurrentChat,
    getAllChats,
    deleteChatSession,
    addChatSession,
    updateChatName,
    addMessage,
    addScene,
    clearScenes,
    getScenesForChat
  } = useWorkspace();
  const dataManager = useDatabase();

  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const scene = _scene;
  const onSceneUpdate = _onSceneUpdate;

  const isMinimized = isOverlayMinimized('chat');
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 700, height: 600 });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Register overlay
  useEffect(() => {
    if (isOpen) {
      registerOverlay('chat', 'chat', 1000);
      return () => unregisterOverlay('chat');
    }
  }, [isOpen, registerOverlay, unregisterOverlay]);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      if (mobile && isOpen) {
        // Full screen on mobile
        setPosition({ x: 0, y: 0 });
        setSize({ width: window.innerWidth, height: window.innerHeight });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // Set initial position
  useEffect(() => {
    if (isOpen) {
      if (isMobile) {
        // Full screen on mobile
        setPosition({ x: 0, y: 0 });
        setSize({ width: window.innerWidth, height: window.innerHeight });
      } else {
        // Desktop positioning
        const initialPos = { x: Math.max(60, window.innerWidth - 540), y: 60 };
        const initialSize = { width: 500, height: Math.min(600, window.innerHeight - 100) };
        setPosition(initialPos);
        setSize(initialSize);
      }
    }
  }, [isOpen, isMobile]);

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMinimize('chat');
  };

  // Get current chat - memoize to prevent unnecessary re-renders
  const currentChat = getChatOverlayCurrentChat();
  const currentChatId = currentChat?.id;
  const workspaceMessages = currentChat?.messages ?? EMPTY_MESSAGES;
  const allChats = getAllChats();

  // Conversation hook
  const { messages, isLoading, sendMessage } = useConversation({
    initialMessage: '',
    currentScene: scene,
    onSceneUpdate: onSceneUpdate,
    chatId: currentChatId || '',
    dataManager: dataManager,
    workspaceMessages: workspaceMessages as any,
    updateConversation: null,
    addMessageToWorkspace: addMessage,
    shouldSwitchScene: true
  });

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const messageText = input.trim();
    setInput('');
    await sendMessage(messageText);

    if (currentChat && currentChat.messages) {
      const userMessages = currentChat.messages.filter((msg: any) => msg.isUser);
      if (userMessages.length === 1) {
        const truncatedName = messageText.length > 30 ? messageText.substring(0, 30) + '...' : messageText;
        updateChatName(currentChat.id, truncatedName);
      }
    }
  };

  // Handle example scene selection
  const handleSelectExampleScene = async (sceneId: string) => {
    try {
      const exampleData = await loadExampleScene(sceneId);
      if (!exampleData) return;

      // Create a new chat for this example
      const newChat = addChatSession();
      if (!newChat) return;

      // Set chat name to example scene name
      updateChatName(newChat.id, exampleData.scene.name);

      // Add the scene
      clearScenes(); // Clear any existing scenes first
      addScene(exampleData.sceneData, true);

      // Add example messages to chat
      exampleData.messages.forEach((msg: any) => {
        addMessage({
          ...msg,
          chatId: newChat.id
        });
      });

      // Switch to the new chat
      setChatOverlayCurrentChat(newChat.id);
      
      // Close sidebar on mobile
      if (window.innerWidth <= 768) setSidebarCollapsed(true);
    } catch (error) {
      console.error('Error loading example scene:', error);
    }
  };

  // Filter chats based on search query
  const filteredChats = searchQuery
    ? allChats.filter((chat: any) => {
        const chatName = (chat.name || `Chat ${chat.id.slice(-6)}`).toLowerCase();
        return chatName.includes(searchQuery.toLowerCase());
      })
    : allChats;

  const handleChatSelect = (chatId: string) => {
    setChatOverlayCurrentChat(chatId);
    if (window.innerWidth <= 768) setSidebarCollapsed(true);
  };

  const handleNewChat = () => {
    const newChat = addChatSession();
    if (newChat) {
      setChatOverlayCurrentChat(newChat.id);
    }
    if (window.innerWidth <= 768) setSidebarCollapsed(true);
  };

  const handleDeleteChat = (chatId: string) => { // Removed 'e' arg to match interface if needed, or handle inside
    // ChatSidebar passes id.
    deleteChatSession(chatId);
  };

  if (!isOpen) return null;

  const minimizedContent = (
    <div 
      className="unified-overlay-minimized"
      style={{
        '--chat-bg-opacity': overlayOpacity.chat,
        zIndex: getZIndex('chat')
      } as React.CSSProperties}
      onClick={() => toggleMinimize('chat')}
    >
      <FontAwesomeIcon icon={faComments} />
      <span>Chat & Scenes</span>
    </div>
  );

  if (isMinimized) {
    return (
      <div
        className="unified-overlay-container minimized"
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          zIndex: getZIndex('unified')
        }}
      >
        {minimizedContent}
      </div>
    );
  }

  // Mobile uses fixed positioning, desktop uses draggable
  const overlayContent = (
    <div 
      className={`unified-overlay-container ${isMobile ? 'mobile' : ''}`}
      style={{ '--chat-bg-opacity': overlayOpacity.chat } as React.CSSProperties}
      onClick={() => focusOverlay('chat')}
    >
        {/* Header */}
        <div className="unified-overlay-header">
          <div className="unified-overlay-title">
            <FontAwesomeIcon icon={faComments} />
            <span>Chat & Scenes</span>
          </div>
          <div className="unified-overlay-controls">
            <button onClick={handleMinimize} title="Minimize">
              <FontAwesomeIcon icon={faChevronDown} />
            </button>
            <button onClick={onToggle} title="Close">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="unified-overlay-main chat-view-container">
          <ChatSidebar
            collapsed={sidebarCollapsed}
            onClose={() => setSidebarCollapsed(true)}
            chats={filteredChats}
            currentChatId={currentChatId}
            onSelectChat={handleChatSelect}
            onNewChat={handleNewChat}
            onDeleteChat={handleDeleteChat}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            getSceneCount={(chatId: string) => {
               const scenes = getScenesForChat(chatId);
               return scenes ? scenes.length : 0;
            }}
            onSelectExampleScene={handleSelectExampleScene}
          />

          <div className="chat-main">
            {sidebarCollapsed && (
              <div style={{ padding: '8px 12px', background: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)', display: 'flex' }}>
                <button 
                  onClick={() => setSidebarCollapsed(false)}
                  className="sidebar-toggle"
                  title="Open Sidebar"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            <MessageList 
              messages={messages} 
              isLoading={isLoading} 
              chatId={currentChatId || ''}
              onSuggestionClick={(text) => setInput(text)}
            />

            <ChatInput 
              input={input} 
              onInputChange={setInput} 
              onSend={handleSend} 
              isLoading={isLoading} 
            />
          </div>
        </div>
      </div>
  );

  // Render mobile fixed or desktop draggable
  if (isMobile) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 44, // Status bar height on mobile
          zIndex: getZIndex('chat')
        }}
      >
        {overlayContent}
      </div>
    );
  }

  return (
    <Rnd
      position={position}
      size={size}
      onDragStop={(_e, d) => {
        setPosition({ x: d.x, y: d.y });
      }}
      onResizeStop={(_e, _direction, ref, _delta, pos) => {
        const newSize = {
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height)
        };
        setSize(newSize);
        setPosition(pos);
      }}
      minWidth={350}
      minHeight={400}
      maxWidth={800}
      maxHeight={window.innerHeight - 100}
      bounds="parent"
      dragHandleClassName="unified-overlay-header"
      style={{
        zIndex: getZIndex('chat')
      }}
    >
      {overlayContent}
    </Rnd>
  );
};
