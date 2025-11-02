import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  Plus,
  Trash2,
  Copy,
  Search,
  Menu,
  MessageSquare,
  Zap,
} from "lucide-react";

import { useConversation } from "../ui-logic/chat/Conversation";
import { useTheme } from "../contexts/ThemeContext";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { useDatabase } from "../contexts/DatabaseContext";
import ScenePreviewCard from "./components/chat/ScenePreviewCard";

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
    addMessageToWorkspace: addMessage // Pass addMessage function for persistence
  });

  // Removed greeting - no automatic welcome message

  const scrollToBottom = useCallback(() => {
    // Use a small delay to allow content (including preview cards) to render first
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // KaTeX rendering
  useEffect(() => {
    const renderKaTeX = () => {
      if (window.katex && window.renderMathInElement) {
        try {
          window.renderMathInElement(document.body, {
            delimiters: [
              { left: "$$", right: "$$", display: true },
              { left: "$", right: "$", display: false },
            ],
            throwOnError: false,
          });
        } catch (error) {
          console.warn("KaTeX rendering failed:", error);
        }
      }
    };
    const timeoutId = setTimeout(renderKaTeX, 100);
    return () => clearTimeout(timeoutId);
  }, [messages.length]);

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

    // LaTeX blocks
    formatted = formatted.replace(/\$\$([\s\S]*?)\$\$/g, (_match: string, equation: string) => {
      const id = `latex-block-${Math.random().toString(36).substr(2, 9)}`;
      setTimeout(() => {
        if (window.katex) {
          const element = document.getElementById(id);
          if (element) {
            try {
              window.katex.render(equation.trim(), element, {
                displayMode: true,
                throwOnError: false,
              });
            } catch (e) {
              console.warn("KaTeX error:", e);
            }
          }
        }
      }, 0);
      return `<div id="${id}" class="latex-block">${equation.trim()}</div>`;
    });

    // Inline LaTeX
    formatted = formatted.replace(/\$([^$\n]+)\$/g, (_match: string, equation: string) => {
      const id = `latex-inline-${Math.random().toString(36).substr(2, 9)}`;
      setTimeout(() => {
        if (window.katex) {
          const element = document.getElementById(id);
          if (element) {
            try {
              window.katex.render(equation.trim(), element, {
                displayMode: false,
                throwOnError: false,
              });
            } catch (e) {
              console.warn("KaTeX error:", e);
            }
          }
        }
      }, 0);
      return `<span id="${id}" class="latex-inline">${equation.trim()}</span>`;
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

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        overflow: "hidden",
        backgroundColor: theme === "dark" ? "#0a0a0a" : "#ffffff",
        color: theme === "dark" ? "#e0e0e0" : "#1a1a1a",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: sidebarCollapsed ? "0" : "260px",
          minWidth: sidebarCollapsed ? "0" : "260px",
          backgroundColor: theme === "dark" ? "#0f0f0f" : "#f8f8f8",
          borderRight: `1px solid ${theme === "dark" ? "#1a1a1a" : "#e0e0e0"}`,
          display: "flex",
          flexDirection: "column",
          transition: "width 0.3s ease",
          overflow: "hidden",
        }}
      >
        {!sidebarCollapsed && (
          <>
            <div style={{ padding: "16px", borderBottom: `1px solid ${theme === "dark" ? "#1a1a1a" : "#e0e0e0"}` }}>
              <button
                onClick={() => {
                  const newChat = addChatSession();
                  if (newChat) {
                    selectChatSession(newChat.id);
                  }
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: theme === "dark" ? "#1a1a1a" : "#007bff",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                <Plus size={18} />
                New Chat
              </button>
              
              {/* Search Bar */}
              <div style={{ position: "relative", marginTop: "12px" }}>
                <Search
                  size={16}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: theme === "dark" ? "#666" : "#999",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px 8px 36px",
                    backgroundColor: theme === "dark" ? "#1a1a1a" : "#f0f0f0",
                    border: "none",
                    borderRadius: "8px",
                    color: theme === "dark" ? "#e0e0e0" : "#1a1a1a",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => selectChatSession(chat.id)}
                  style={{
                    padding: "12px",
                    marginBottom: "4px",
                    backgroundColor: currentChat?.id === chat.id 
                      ? theme === "dark" ? "#1a1a1a" : "#e8f0fe"
                      : "transparent",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, overflow: "hidden" }}>
                    <MessageSquare size={16} />
                    <span style={{ fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {chat.name || `Chat ${chat.id.slice(-6)}`}
                    </span>
                  </div>
                  {currentChat?.id === chat.id && allChats.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChatSession(chat.id);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: theme === "dark" ? "#666" : "#999",
                        padding: "4px",
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
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div
          style={{
            height: "60px",
            borderBottom: `1px solid ${theme === "dark" ? "#1a1a1a" : "#e0e0e0"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: theme === "dark" ? "#e0e0e0" : "#1a1a1a",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Menu size={20} />
            </button>
            <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>
              Physics AI Chat
            </h2>
          </div>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Suggestions for empty chat */}
          {filteredMessages.length === 0 && (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: "32px",
              paddingBottom: "60px"
            }}>
              <div style={{
                textAlign: "center",
                maxWidth: "600px"
              }}>
                <h2 style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  marginBottom: "12px",
                  color: theme === "dark" ? "#e0e0e0" : "#1a1a1a"
                }}>
                  What can I help you with?
                </h2>
                <p style={{
                  fontSize: "16px",
                  color: theme === "dark" ? "#a0a0a0" : "#666",
                  marginBottom: "32px"
                }}>
                  Ask me to create physics simulations, visualize concepts, or answer questions
                </p>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "16px",
                width: "100%",
                maxWidth: "900px"
              }}>
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
                    icon: "�"
                  }
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(suggestion.title)}
                    style={{
                      padding: "20px",
                      background: theme === "dark" ? "#1a1a1a" : "#f8f9fa",
                      border: `1px solid ${theme === "dark" ? "#333" : "#e0e0e0"}`,
                      borderRadius: "12px",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#007bff";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,123,255,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = theme === "dark" ? "#333" : "#e0e0e0";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{
                      fontSize: "24px",
                      marginBottom: "8px"
                    }}>
                      {suggestion.icon}
                    </div>
                    <div style={{
                      fontSize: "15px",
                      fontWeight: "600",
                      marginBottom: "4px",
                      color: theme === "dark" ? "#e0e0e0" : "#1a1a1a"
                    }}>
                      {suggestion.title}
                    </div>
                    <div style={{
                      fontSize: "13px",
                      color: theme === "dark" ? "#888" : "#666"
                    }}>
                      {suggestion.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredMessages.map((message) => (
            <div
              key={message.id}
              style={{
                display: "flex",
                marginBottom: "32px",
                alignItems: "flex-start",
                gap: "16px",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: message.isUser
                    ? "#007bff"
                    : theme === "dark"
                    ? "#1a1a1a"
                    : "#f0f0f0",
                  border: message.isUser
                    ? "none"
                    : `1px solid ${theme === "dark" ? "#333" : "#e0e0e0"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: message.isUser ? "white" : "inherit",
                  fontWeight: "bold",
                  flexShrink: 0,
                  fontSize: "14px",
                }}
              >
                {message.isUser ? "U" : <Zap size={20} />}
              </div>

              {/* Message Content */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontWeight: "700", fontSize: "14px" }}>
                    {message.isUser ? "You" : "Physics AI"}
                  </span>
                  <span
                    style={{
                      marginLeft: "12px",
                      fontSize: "12px",
                      color: theme === "dark" ? "#888" : "#666",
                    }}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div
                  className="message-body"
                  style={{
                    fontSize: "15px",
                    lineHeight: "1.7",
                    color: theme === "dark" ? "#e0e0e0" : "#1a1a1a",
                    wordBreak: "break-word",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: formatMessageText(message.text || (message as any).content || ''),
                  }}
                />

                {/* Scene Preview Card */}
                {!message.isUser && (message as any).sceneMetadata?.hasSceneGeneration && (
                  <ScenePreviewCard 
                    message={message as any}
                    chatId={currentChatId || ''}
                  />
                )}

                <div
                  style={{
                    marginTop: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: theme === "dark" ? "#888" : "#666",
                  }}
                >
                  <button
                    onClick={() => handleCopyMessage(message.text)}
                    title="Copy"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "inherit",
                      padding: "4px",
                    }}
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: theme === "dark" ? "#1a1a1a" : "#f0f0f0",
                  border: `1px solid ${theme === "dark" ? "#333" : "#e0e0e0"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Zap size={20} />
              </div>
              <div style={{ display: "flex", gap: "4px" }}>
                <span className="typing-dot">●</span>
                <span className="typing-dot">●</span>
                <span className="typing-dot">●</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          style={{
            borderTop: `1px solid ${theme === "dark" ? "#1a1a1a" : "#e0e0e0"}`,
            padding: "16px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "flex-end",
              backgroundColor: theme === "dark" ? "#1a1a1a" : "#f8f8f8",
              borderRadius: "12px",
              padding: "12px",
              border: `1px solid ${theme === "dark" ? "#2a2a2a" : "#e0e0e0"}`,
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask anything..."
              disabled={isLoading}
              style={{
                flex: 1,
                backgroundColor: "transparent",
                border: "none",
                outline: "none",
                color: theme === "dark" ? "#e0e0e0" : "#1a1a1a",
                fontSize: "15px",
                resize: "none",
                minHeight: "24px",
                maxHeight: "200px",
                fontFamily: "inherit",
              }}
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              style={{
                backgroundColor: input.trim() && !isLoading ? "#007bff" : theme === "dark" ? "#2a2a2a" : "#e0e0e0",
                color: input.trim() && !isLoading ? "#ffffff" : theme === "dark" ? "#666" : "#999",
                border: "none",
                borderRadius: "8px",
                padding: "10px 16px",
                cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              <Send size={16} />
              Send
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .msg-h1 {
          font-size: 24px;
          font-weight: 700;
          margin: 16px 0 8px 0;
        }
        .msg-h2 {
          font-size: 20px;
          font-weight: 600;
          margin: 14px 0 6px 0;
        }
        .msg-h3 {
          font-size: 18px;
          font-weight: 600;
          margin: 12px 0 6px 0;
        }
        .code-block {
          background-color: ${theme === "dark" ? "#1a1a1a" : "#f5f5f5"};
          border: 1px solid ${theme === "dark" ? "#2a2a2a" : "#e0e0e0"};
          border-radius: 8px;
          padding: 16px;
          overflow-x: auto;
          margin: 12px 0;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.5;
        }
        .inline-code {
          background-color: ${theme === "dark" ? "#1a1a1a" : "#f0f0f0"};
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 14px;
        }
        .list-item, .list-item-numbered {
          margin-left: 20px;
          margin-bottom: 4px;
        }
        .latex-block {
          margin: 16px 0;
          text-align: center;
          font-size: 18px;
        }
        .latex-inline {
          margin: 0 2px;
        }
        .typing-dot {
          animation: typing 1.4s infinite;
          opacity: 0;
          font-size: 20px;
        }
        .typing-dot:nth-child(1) {
          animation-delay: 0s;
        }
        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes typing {
          0%, 60%, 100% {
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default ModernChatInterface;
