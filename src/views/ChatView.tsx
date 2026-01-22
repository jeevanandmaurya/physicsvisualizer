import { useState } from "react";
import {
  Plus,
  ChevronRight,
  MessageSquare,
  Sparkles,
} from "lucide-react";

import { useConversation } from "../ui-logic/chat/Conversation";
import { useTheme } from "../contexts/ThemeContext";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { useNavigation } from "../contexts/NavigationContext";
import { useDatabase } from "../contexts/DatabaseContext";
import { loadExampleScene } from "../utils/exampleScenes";
import "./ChatView.css";

import { ChatSidebar } from "./components/chat/ChatSidebar";
import { ChatInput } from "./components/chat/ChatInput";
import { MessageList } from "./components/chat/MessageList";
import demoMessages from "./components/chat/demoMessages";



interface ModernChatInterfaceProps {
  onViewChange?: (view: string) => void;
  isOverlayMode?: boolean;
  onClose?: () => void;
}

function ModernChatInterface({ onViewChange, isOverlayMode = false, onClose }: ModernChatInterfaceProps) {
  const { 
    getChatViewCurrentChat, // Get ChatView's current chat (from shared history)
  } = useWorkspace();

  // Get current chat for ChatView (from shared history)
  const currentChat = getChatViewCurrentChat();
  const currentChatId = currentChat?.id;

  // If no chat is selected, show empty state
  if (!currentChatId) {
    return <ChatEmptyState onViewChange={onViewChange} isOverlayMode={isOverlayMode} />;
  }

  // Use key prop to force remount when chat changes - ensures complete isolation
  return <ChatInstance key={currentChatId} chatId={currentChatId} onViewChange={onViewChange} isOverlayMode={isOverlayMode} onClose={onClose} />;
}

// Separate component that gets remounted for each chat
function ChatInstance({ chatId, onViewChange: _onViewChange, isOverlayMode = false, onClose }: { chatId: string; onViewChange?: (view: string) => void; isOverlayMode?: boolean; onClose?: () => void }) {
  const { setCurrentView } = useNavigation();
  const {
    getChatViewCurrentChat,
    setChatViewCurrentChat,
    getAllChats,
    deleteChatSession,
    addChatSession,
    updateChatName,
    addMessage,
    getScenesForChat,
    addScene,
    clearScenes,
    replaceCurrentScene
  } = useWorkspace();
  const dataManager = useDatabase();

  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Get current chat data
  const currentChat = getChatViewCurrentChat();
  const allChats = getAllChats();
  const workspaceMessages = currentChat?.messages || [];

  // Get chat-specific scene (not global scene)
  const chatScenes = chatId ? getScenesForChat(chatId) : [];
  const chatSpecificScene = chatScenes.length > 0 
    ? chatScenes[chatScenes.length - 1] // Use most recent scene for this chat
    : { id: `chat-only-${chatId || 'default'}`, objects: [] }; // Empty scene per chat

  // Conversation hook - with direct workspace integration
  const { messages, isLoading, sendMessage } = useConversation({
    initialMessage: null as any,
    chatId: chatId || '',
    currentScene: chatSpecificScene,
    onSceneUpdate: () => {},
    updateConversation: null, // Not used
    dataManager: dataManager,
    workspaceMessages: workspaceMessages as any, // Use workspace messages directly
    addMessageToWorkspace: addMessage, // Pass addMessage function for persistence
    shouldSwitchScene: false // Don't switch global scene when in full chat view
  });

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const messageText = input.trim();
    setInput("");
    
    // Send to AI (will add the message internally)
    await sendMessage(messageText);

    // Update chat name if this is the first user message
    if (currentChat && currentChat.messages) {
      const userMessages = currentChat.messages.filter((msg: any) => msg.isUser);
      if (userMessages.length === 1) {
        // This is the first user message, update chat name
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

      // Clear and load the example scene
      clearScenes();
      replaceCurrentScene(exampleData.sceneData);

      // Add example messages to chat
      exampleData.messages.forEach(msg => {
        addMessage({
          ...msg,
          chatId: newChat.id
        });
      });

      // Switch to the new chat (without reloading scenes)
      setChatViewCurrentChat(newChat.id, true);
      
      // Close sidebar on mobile
      if (window.innerWidth <= 768) setSidebarCollapsed(true);
    } catch (error) {
      console.error('Error loading example scene:', error);
    }
  };

  // Filter chats based on search query
  const filteredChats = searchQuery
    ? allChats.filter((chat) => {
        const chatName = (chat.name || `Chat ${chat.id.slice(-6)}`).toLowerCase();
        return chatName.includes(searchQuery.toLowerCase());
      })
    : allChats;

  const handleNewChat = () => {
    const newChat = addChatSession();
    if (newChat) {
      // Skip scene reload since addChatSession already creates a default scene
      setChatViewCurrentChat(newChat.id, true);
      setCurrentView('chat'); // Navigate to chat view
    }
    // On mobile, close sidebar after creating new chat
    if (window.innerWidth <= 768) setSidebarCollapsed(true);
  };

  const getSceneCount = (cId: string) => {
    const scenes = getScenesForChat(cId);
    return scenes ? scenes.length : 0;
  };

  const totalTokens = messages.reduce((acc, msg: any) => {
      if (msg.tokenUsage && typeof msg.tokenUsage.totalTokens === 'number') {
          return acc + msg.tokenUsage.totalTokens;
      }
      return acc;
  }, 0);

  return (
    <div className="chat-view-container">
      {/* Backdrop for mobile */}
      {!sidebarCollapsed && (
        <div 
          className="chat-backdrop" 
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      <ChatSidebar
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarCollapsed(true)}
        chats={filteredChats}
        currentChatId={currentChat?.id}
        onSelectChat={(id) => {
            setChatViewCurrentChat(id);
            if (window.innerWidth <= 768) setSidebarCollapsed(true);
        }}
        onNewChat={handleNewChat}
        onDeleteChat={deleteChatSession}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        getSceneCount={getSceneCount}
        onSelectExampleScene={handleSelectExampleScene}
      />

      {/* Main Chat Area */}
      <div className="chat-main">
        {/* Header */}
        {!isOverlayMode && (
          <div className="chat-header">
            <div className="chat-header-left">
              <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} title={sidebarCollapsed ? "Open Sidebar" : "Close Sidebar"}>
                <ChevronRight size={20} style={{ transform: sidebarCollapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }} />
              </button>
              <div>
                <h2 className="chat-header-title">Physics AI Chat</h2>
                {totalTokens > 0 && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Total Used: {totalTokens.toLocaleString()} tokens
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <MessageList 
            messages={messages}
            isLoading={isLoading}
            chatId={chatId}
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
  );
}

// Empty state when no chat is selected
function ChatEmptyState({ onViewChange: _onViewChange, isOverlayMode = false }: { onViewChange?: (view: string) => void; isOverlayMode?: boolean }) {
  const { theme } = useTheme();
  const { addChatSession, setChatViewCurrentChat } = useWorkspace();
  const { setCurrentView } = useNavigation();

  return (
    <div className="chat-interface modern-chat" data-theme={theme}>
      <div className="chat-main-content">
        <div className="empty-state">
          <MessageSquare size={64} className="empty-icon" />
          <h2>No chat selected</h2>
          <p>Create a new chat to get started</p>
          <button
            className="new-chat-btn"
            onClick={() => {
              const newChat = addChatSession();
              if (newChat) {
                setChatViewCurrentChat(newChat.id);
                setCurrentView('chat');
              }
            }}
          >
            <Plus size={18} />
            New Chat
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModernChatInterface;
