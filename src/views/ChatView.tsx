import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  Plus,
  Trash2,
  Copy,
  Search,
  Menu,
  X,
  MessageSquare,
} from "lucide-react";

import { useConversation } from "../ui-logic/chat/Conversation";
import { useTheme } from "../contexts/ThemeContext";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { useDatabase } from "../contexts/DatabaseContext";
import ScenePreviewCard from "./components/chat/ScenePreviewCard";
import "./ChatView.css";

declare global {
  interface Window {
    katex?: any;
    renderMathInElement?: (element: Element, options?: any) => void;
  }
}

interface ModernChatInterfaceProps {
  onViewChange: (view: string) => void;
}

function ModernChatInterface({ onViewChange }: ModernChatInterfaceProps) {
  const { theme } = useTheme();
  const { 
    getCurrentChat, 
    getAllChats, 
    deleteChatSession, 
    addChatSession,
    selectChatSession,
    updateChatName,
    addMessage,
    getScenesForChat
  } = useWorkspace();
  const workspaceMessages = getCurrentChat()?.messages || [];
  const dataManager = useDatabase();

  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const chatMessagesRef = useRef<HTMLDivElement | null>(null);

  const currentChat = getCurrentChat();
  const allChats = getAllChats();
  const currentChatId = currentChat?.id;

  // Get chat-specific scene (not global scene)
  const chatScenes = currentChatId ? getScenesForChat(currentChatId) : [];
  const chatSpecificScene = chatScenes.length > 0 
    ? chatScenes[chatScenes.length - 1] // Use most recent scene for this chat
    : { id: `chat-only-${currentChatId || 'default'}`, objects: [] }; // Empty scene per chat

  // Conversation hook - with direct workspace integration
  const { messages, isLoading, sendMessage } = useConversation({
    initialMessage: null as any,
    chatId: currentChatId || '',
    currentScene: chatSpecificScene,
    onSceneUpdate: () => {},
    updateConversation: null, // Not used
    dataManager: dataManager,
    workspaceMessages: workspaceMessages as any, // Use workspace messages directly
    addMessageToWorkspace: addMessage, // Pass addMessage function for persistence
    shouldSwitchScene: false // Don't switch global scene when in full chat view
  });

  // Removed greeting - no automatic welcome message

  const scrollToBottom = useCallback(() => {
    // Use a small delay to allow content (including preview cards) to render first
    requestAnimationFrame(() => {
      if (chatMessagesRef.current) {
        chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // KaTeX rendering
  useEffect(() => {
    const renderKaTeX = () => {
      if (window.katex && chatMessagesRef.current) {
        const elements = chatMessagesRef.current.querySelectorAll('[data-latex]');
        elements.forEach((el: any) => {
          const latex = decodeURIComponent(el.getAttribute('data-latex') || '');
          const displayMode = el.getAttribute('data-display') === 'true';
          try {
            window.katex.render(latex, el, {
              displayMode,
              throwOnError: false,
              strict: false,
            });
            // Remove the attribute to mark as rendered
            el.removeAttribute('data-latex');
          } catch (error) {
            console.warn("KaTeX rendering failed for element:", error);
          }
        });
      }
    };
    
    renderKaTeX();
    // Small delay to catch any late renders
    const timeoutId = setTimeout(renderKaTeX, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const messageText = input.trim();
    setInput("");
    
    // Send to AI (will add the message internally)
    await sendMessage(messageText);

    // Update chat name if this is the first user message
    const currentChat = getCurrentChat();
    if (currentChat && currentChat.messages) {
      const userMessages = currentChat.messages.filter((msg: any) => msg.isUser);
      if (userMessages.length === 1) {
        // This is the first user message, update chat name
        const truncatedName = messageText.length > 30 ? messageText.substring(0, 30) + '...' : messageText;
        updateChatName(currentChat.id, truncatedName);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatMessageText = (text: string): string => {
    if (!text) return '';
    let formatted = text;

    // LaTeX blocks - use data attributes for reliable rendering
    formatted = formatted.replace(/\$\$([\s\S]*?)\$\$/g, (_match: string, equation: string) => {
      return `<div class="latex-block" data-latex="${encodeURIComponent(equation.trim())}" data-display="true"></div>`;
    });

    // Inline LaTeX - use data attributes
    formatted = formatted.replace(/\$([^$\n]+)\$/g, (_match: string, equation: string) => {
      return `<span class="latex-inline" data-latex="${encodeURIComponent(equation.trim())}" data-display="false"></span>`;
    });

    // Headers
    formatted = formatted.replace(/^### (.*$)/gm, '<h3 class="msg-h3">$1</h3>');
    formatted = formatted.replace(/^## (.*$)/gm, '<h2 class="msg-h2">$1</h2>');
    formatted = formatted.replace(/^# (.*$)/gm, '<h1 class="msg-h1">$1</h1>');

    // Code blocks
    formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (_match: string, lang: string, code: string) => {
      return `<pre class="code-block"><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`;
    });

    // Inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Bold and italic
    formatted = formatted.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Lists
    formatted = formatted.replace(/^- (.*$)/gm, '<li class="list-item">$1</li>');
    formatted = formatted.replace(/^(\d+)\. (.*$)/gm, '<li class="list-item-numbered">$2</li>');

    // Line breaks
    formatted = formatted.replace(/\n/g, "<br />");

    return formatted;
  };

  // Filter chats based on search query
  const filteredChats = searchQuery
    ? allChats.filter((chat) => {
        const chatName = (chat.name || `Chat ${chat.id.slice(-6)}`).toLowerCase();
        return chatName.includes(searchQuery.toLowerCase());
      })
    : allChats;
  
  // Use all messages for the current chat (no message filtering)
  const filteredMessages = messages;

  // Find the latest message with scene generation (create or modify action)
  const latestSceneMessageId = React.useMemo(() => {
    // Iterate from end to start to find the most recent scene generation
    for (let i = filteredMessages.length - 1; i >= 0; i--) {
      const msg = filteredMessages[i];
      if (!msg.isUser && 
          (msg as any).sceneMetadata?.hasSceneGeneration && 
          (msg as any).sceneMetadata?.sceneAction !== 'none') {
        return msg.id;
      }
    }
    return null;
  }, [filteredMessages]);

  return (
    <div className="chat-view-container">
      {/* Backdrop for mobile */}
      {!sidebarCollapsed && (
        <div 
          className="chat-backdrop" 
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div className={`chat-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {!sidebarCollapsed && (
          <>
            <div className="sidebar-header">
              <div className="sidebar-header-top">
                <button
                  className="new-chat-btn"
                  onClick={() => {
                    const newChat = addChatSession();
                    if (newChat) selectChatSession(newChat.id);
                    // On mobile, close sidebar after creating new chat
                    if (window.innerWidth <= 768) setSidebarCollapsed(true);
                  }}
                >
                  <Plus size={18} />
                  New Chat
                </button>
                <button 
                  className="sidebar-close-mobile"
                  onClick={() => setSidebarCollapsed(true)}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="sidebar-search">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="sidebar-content">
              <div className="sidebar-section-label">Recent Chats</div>
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`chat-session-item ${currentChat?.id === chat.id ? 'active' : ''}`}
                  onClick={() => {
                    selectChatSession(chat.id);
                    if (window.innerWidth <= 768) setSidebarCollapsed(true);
                  }}
                >
                  <div className="session-info">
                    <MessageSquare size={16} />
                    <span className="session-name">
                      {chat.name || `Chat ${chat.id.slice(-6)}`}
                    </span>
                  </div>
                  {currentChat?.id === chat.id && allChats.length > 1 && (
                    <button
                      className="delete-session-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChatSession(chat.id);
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              <Menu size={20} />
            </button>
            <h2 className="chat-header-title">Physics AI Chat</h2>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages" ref={chatMessagesRef}>
          {/* Suggestions for empty chat */}
          {filteredMessages.length === 0 && (
            <div className="chat-empty-state">
              <div className="chat-welcome-text">
                <h2 className="chat-welcome-title">What can I help you with?</h2>
                <p className="chat-welcome-subtitle">
                  Ask me to create physics simulations, visualize concepts, or answer questions
                </p>
              </div>

              <div className="chat-suggestions-grid">
                {[
                  {
                    title: "Physics simulation",
                    description: "Create realistic physics simulations with gravity, collisions, and forces",
                    icon: "⚛️"
                  },
                  {
                    title: "Non-physics visualization",
                    description: "Generate creative visuals, patterns, and animations without physics",
                    icon: "🎨"
                  },
                  {
                    title: "Annotation demo",
                    description: "Add labels, arrows, and annotations to explain concepts",
                    icon: "📍"
                  }
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(suggestion.title)}
                    className="suggestion-card"
                  >
                    <div className="suggestion-icon">
                      {suggestion.icon}
                    </div>
                    <div className="suggestion-title">
                      {suggestion.title}
                    </div>
                    <div className="suggestion-description">
                      {suggestion.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredMessages.map((message) => (
            <div key={message.id} className={`message-item ${message.isUser ? 'user' : 'ai'}`}>
              {/* Message Content */}
              <div className="message-content">
                <div
                  className="message-body"
                  dangerouslySetInnerHTML={{
                    __html: formatMessageText(message.text || (message as any).content || ''),
                  }}
                />

                {/* Scene Preview Card - Only show for the latest message with scene generation */}
                {!message.isUser && 
                 message.id === latestSceneMessageId && 
                 (message as any).sceneMetadata?.hasSceneGeneration && (
                  <ScenePreviewCard 
                    message={message as any}
                    chatId={currentChatId || ''}
                  />
                )}

                <div className="message-actions">
                  <button
                    onClick={() => handleCopyMessage(message.text)}
                    title="Copy"
                    className="action-button"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message-item ai loading">
              <div className="typing-indicator">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask anything..."
              disabled={isLoading}
              className="chat-textarea"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="chat-send-button"
            >
              <Send size={18} />
              <span className="send-text">Send</span>
            </button>
          </div>
          <div className="chat-input-footer">
            AI can make mistakes. Check important info.
          </div>
        </div>
      </div>

    </div>
  );
}

export default ModernChatInterface;
