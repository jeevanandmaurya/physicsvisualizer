import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Plus,
  Trash2,
  Copy,
  RotateCcw,
  Search,
  Download,
  MessageSquare,
  Zap,
  Eye
} from 'lucide-react';
import { useConversation } from '../features/chat/components/Conversation';
import { useWorkspace, useWorkspaceScene } from '../contexts/WorkspaceContext';
import { useTheme } from '../contexts/ThemeContext';

function ChatView({ onViewChange }) {
  const { theme } = useTheme();
  const { getChatForScene, linkSceneToChat } = useWorkspace();
  const { scene, updateCurrentScene } = useWorkspaceScene();

  const [chatId, setChatId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  // FIX: Removed unused 'isSearchMode' state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize conversation hook
  const {
    messages,
    isLoading,
    sendMessage,
    regenerateResponse,
    clearConversation,
    loadConversation
  } = useConversation({
    initialMessage: "Hello! I'm your Physics AI Assistant. I can help you with physics concepts, create 3D visualizations, and discuss scientific phenomena. What would you like to explore today?",
    currentScene: scene,
    onSceneUpdate: updateCurrentScene,
    chatId: chatId,
    updateConversation: (msgs) => {
      // Auto-save current conversation
      if (chatId && msgs.length > 1) {
        const conversationData = {
          id: chatId,
          messages: msgs,
          timestamp: new Date(),
          sceneId: scene?.id,
          title: generateConversationTitle(msgs)
        };
        localStorage.setItem(`chat_${chatId}`, JSON.stringify(conversationData));
        refreshChatHistory();
      }
    }
  });

  // Generate conversation title from first user message
  const generateConversationTitle = (msgs) => {
    const firstUserMessage = msgs.find(m => m.isUser);
    if (firstUserMessage) {
      return firstUserMessage.text.length > 50
        ? firstUserMessage.text.substring(0, 50) + '...'
        : firstUserMessage.text;
    }
    return 'New Conversation';
  };

  useEffect(() => {
    if (scene?.id) {
      const existingChat = getChatForScene(scene.id);
      if (existingChat) {
        setChatId(existingChat.id);
      } else {
        const newChatId = Date.now().toString();
        setChatId(newChatId);
        linkSceneToChat(scene.id, newChatId);
      }
    }
  }, [scene?.id, getChatForScene, linkSceneToChat]);

  // Load chat history
  const refreshChatHistory = () => {
    const chats = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('chat_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          chats.push(data);
        } catch (e) {
          console.error('Error parsing chat data:', e);
        }
      }
    }
    chats.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setChatHistory(chats);
  };

  useEffect(() => {
    refreshChatHistory();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const messageText = input.trim();
    setInput('');
    await sendMessage(messageText);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRedirectToVisualizer = () => {
    onViewChange('visualizer');
  };

  const handleSelectChat = (chat) => {
    setSelectedChatId(chat.id);
    setChatId(chat.id);
    loadConversation(chat.id);
  };

  const handleNewChat = () => {
    const newChatId = Date.now().toString();
    setChatId(newChatId);
    setSelectedChatId(null);
    clearConversation();
    setInput('');
    inputRef.current?.focus();
  };

  const handleDeleteChat = (chatId) => {
    if (confirm('Are you sure you want to delete this conversation?')) {
      localStorage.removeItem(`chat_${chatId}`);
      setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
      if (selectedChatId === chatId) {
        handleNewChat();
      }
    }
  };

  const handleExportChat = (chat) => {
    const exportData = {
      title: chat.title || 'Physics Chat Export',
      timestamp: chat.timestamp,
      messages: chat.messages,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `physics-chat-${chat.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyMessage = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Enhanced message formatting with code highlighting
  const formatMessageText = (text) => {
    // Handle code blocks first
    text = text.replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre class="code-block ${theme === 'dark' ? 'dark' : 'light'}" data-lang="${lang || 'text'}"><code>${code.trim()}</code></pre>`;
    });

    // Handle inline code
    text = text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Handle bold and italic
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Handle line breaks
    text = text.replace(/\n/g, '<br>');

    return text;
  };

  // Filter chats based on search
  const filteredChats = chatHistory.filter(chat =>
    !searchQuery ||
    chat.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.messages?.some(msg => msg.text.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // FIX: Removed unused 'currentChat' variable

  return (
    <div className={`chat-view ${theme}`} style={{
      height: '100vh',
      display: 'flex',
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
      color: theme === 'dark' ? '#e0e0e0' : '#1a1a1a'
    }}>
      {/* Styles for typing indicator and code blocks */}
      <style>
        {`
          @keyframes typing {
            0%, 60%, 100% {
              transform: scale(0);
              opacity: 0.5;
            }
            30% {
              transform: scale(1);
              opacity: 1;
            }
          }

          .code-block {
            background: ${theme === 'dark' ? '#2a2a2a' : '#f8f9fa'};
            border: 1px solid ${theme === 'dark' ? '#444' : '#e9ecef'};
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
            overflow-x: auto;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
            line-height: 1.5;
          }

          .code-block code {
            background: none;
            padding: 0;
            border-radius: 0;
            color: inherit;
          }

          .code-block.light {
            color: #1a1a1a;
          }

          .code-block.dark {
            color: #e0e0e0;
          }

          .inline-code {
            background: ${theme === 'dark' ? '#2a2a2a' : '#e9ecef'};
            color: ${theme === 'dark' ? '#e0e0e0' : '#d63384'};
            padding: 2px 4px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.875em;
          }
        `}
      </style>
      {/* Sidebar */}
      <div className={`chat-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} style={{
        width: sidebarCollapsed ? '50px' : '280px',
        borderRight: `1px solid ${theme === 'dark' ? '#333' : '#e5e5e5'}`,
        backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fafafa',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Sidebar Header */}
        <div className="sidebar-header" style={{
          padding: '16px',
          borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#e5e5e5'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {!sidebarCollapsed && (
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '600',
              color: theme === 'dark' ? '#e0e0e0' : '#1a1a1a'
            }}>
              Conversations
            </h3>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: 'none',
              border: 'none',
              color: theme === 'dark' ? '#888' : '#666',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px'
            }}
          >
            <MessageSquare size={18} />
          </button>
        </div>

        {/* Search */}
        {!sidebarCollapsed && (
          <div className="sidebar-search" style={{ padding: '12px 16px' }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Search size={16} style={{
                position: 'absolute',
                left: '12px',
                color: theme === 'dark' ? '#888' : '#666'
              }} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  border: `1px solid ${theme === 'dark' ? '#444' : '#ddd'}`,
                  borderRadius: '20px',
                  backgroundColor: theme === 'dark' ? '#2a2a2a' : '#fff',
                  color: theme === 'dark' ? '#e0e0e0' : '#1a1a1a',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        )}

        {/* New Chat Button */}
        <div style={{ padding: sidebarCollapsed ? '8px' : '0 16px 16px' }}>
          <button
            onClick={handleNewChat}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <Plus size={16} />
            {!sidebarCollapsed && 'New Chat'}
          </button>
        </div>

        {/* Chat List */}
        <div className="chat-list" style={{
          flex: 1,
          overflowY: 'auto',
          padding: sidebarCollapsed ? '0 4px' : '0 8px'
        }}>
          {filteredChats.map(chat => (
            <div
              key={chat.id}
              className={`chat-item ${selectedChatId === chat.id ? 'active' : ''}`}
              onClick={() => handleSelectChat(chat)}
              style={{
                padding: sidebarCollapsed ? '12px 8px' : '12px 16px',
                margin: '4px 0',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: selectedChatId === chat.id
                  ? (theme === 'dark' ? '#2a2a2a' : '#e3f2fd')
                  : 'transparent',
                border: selectedChatId === chat.id
                  ? `1px solid ${theme === 'dark' ? '#444' : '#007bff'}`
                  : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10a37f',
                flexShrink: 0
              }} />
              {!sidebarCollapsed && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: theme === 'dark' ? '#e0e0e0' : '#1a1a1a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: '4px'
                  }}>
                    {chat.title || 'Untitled Chat'}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: theme === 'dark' ? '#888' : '#666',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>{new Date(chat.timestamp).toLocaleDateString()}</span>
                    <span>{chat.messages?.length || 0} msgs</span>
                  </div>
                </div>
              )}
              {!sidebarCollapsed && (
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportChat(chat);
                    }}
                    title="Export conversation"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: theme === 'dark' ? '#888' : '#666',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px'
                    }}
                  >
                    <Download size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChat(chat.id);
                    }}
                    title="Delete conversation"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#dc3545',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff'
      }}>
        {/* Header */}
        <div className="chat-header" style={{
          padding: '12px 24px',
          borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#e5e5e5'}`,
          backgroundColor: theme === 'dark' ? '#1f1f1f' : '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Zap size={20} style={{ color: '#10a37f' }} />
            <div>
              <h2 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: theme === 'dark' ? '#e0e0e0' : '#1a1a1a'
              }}>
                Physics AI Assistant
              </h2>
              <p style={{
                margin: 0,
                fontSize: '12px',
                color: theme === 'dark' ? '#888' : '#666'
              }}>
                Powered by advanced AI for physics education
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleRedirectToVisualizer}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}
            >
              <Eye size={16} />
              Open Visualizer
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages" style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fafafa'
        }}>
          {messages.length === 0 && !isLoading && (
            <div className="welcome-message" style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: theme === 'dark' ? '#888' : '#666'
            }}>
              <MessageSquare size={48} style={{
                marginBottom: '20px',
                opacity: 0.5,
                color: theme === 'dark' ? '#444' : '#ddd'
              }} />
              <h3 style={{
                margin: '0 0 12px 0',
                color: theme === 'dark' ? '#e0e0e0' : '#1a1a1a'
              }}>
                Start a conversation
              </h3>
              <p>Ask me anything about physics, or describe a scene to visualize in 3D!</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`message ${message.isUser ? 'user' : 'ai'}`}
              style={{
                display: 'flex',
                marginBottom: '24px',
                alignItems: 'flex-start',
                maxWidth: '800px',
                marginLeft: message.isUser ? 'auto' : '0',
                marginRight: message.isUser ? '0' : 'auto'
              }}
            >
              <div
                className="message-avatar"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: message.isUser ? '#007bff' : '#10a37f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  marginRight: '16px',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                {message.isUser ? 'U' : 'AI'}
              </div>
              <div className="message-content" style={{ flex: 1 }}>
                <div
                  className="message-text"
                  style={{
                    backgroundColor: message.isUser
                      ? (theme === 'dark' ? '#2a2a2a' : '#007bff')
                      : (theme === 'dark' ? '#2a2a2a' : '#ffffff'),
                    color: message.isUser
                      ? 'white'
                      : (theme === 'dark' ? '#e0e0e0' : '#1a1a1a'),
                    padding: '16px 20px',
                    borderRadius: '16px',
                    border: message.isUser ? 'none' : `1px solid ${theme === 'dark' ? '#444' : '#e5e5e5'}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    lineHeight: '1.6',
                    wordWrap: 'break-word'
                  }}
                  dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }}
                />
                <div className="message-actions" style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: '8px',
                  opacity: 0.7,
                  alignItems: 'center'
                }}>
                  <button
                    onClick={() => handleCopyMessage(message.text)}
                    title="Copy message"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: theme === 'dark' ? '#888' : '#666',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Copy size={12} />
                    Copy
                  </button>
                  {!message.isUser && (
                    <button
                      onClick={() => regenerateResponse(index)}
                      title="Regenerate response"
                      disabled={isLoading}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: theme === 'dark' ? '#888' : '#666',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <RotateCcw size={12} />
                      Regenerate
                    </button>
                  )}
                  <span style={{
                    fontSize: '11px',
                    color: theme === 'dark' ? '#666' : '#888',
                    marginLeft: 'auto'
                  }}>
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div
              className="message ai"
              style={{
                display: 'flex',
                marginBottom: '24px',
                alignItems: 'flex-start',
                maxWidth: '800px'
              }}
            >
              <div
                className="message-avatar"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#10a37f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  marginRight: '16px',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                AI
              </div>
              <div className="message-content">
                <div
                  className="typing-indicator"
                  style={{
                    backgroundColor: theme === 'dark' ? '#2a2a2a' : '#ffffff',
                    border: `1px solid ${theme === 'dark' ? '#444' : '#e5e5e5'}`,
                    padding: '16px 20px',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: '#10a37f',
                      borderRadius: '50%',
                      animation: 'typing 1.4s infinite ease-in-out'
                    }}></span>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: '#10a37f',
                      borderRadius: '50%',
                      animation: 'typing 1.4s infinite 0.2s ease-in-out'
                    }}></span>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: '#10a37f',
                      borderRadius: '50%',
                      animation: 'typing 1.4s infinite 0.4s ease-in-out'
                    }}></span>
                  </div>
                  <span style={{
                    color: theme === 'dark' ? '#888' : '#666',
                    fontSize: '14px'
                  }}>
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input" style={{
          padding: '24px',
          borderTop: `1px solid ${theme === 'dark' ? '#333' : '#e5e5e5'}`,
          backgroundColor: theme === 'dark' ? '#1f1f1f' : '#ffffff'
        }}>
          <div className="input-container" style={{
            maxWidth: '800px',
            margin: '0 auto',
            position: 'relative' // Changed from flex to relative for easier text positioning
          }}>
            <div style={{ position: 'relative' }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about physics or describe a scene..."
                disabled={isLoading}
                style={{
                  width: '100%',
                  minHeight: '52px',
                  maxHeight: '200px',
                  padding: '16px 80px 16px 20px',
                  border: `1px solid ${theme === 'dark' ? '#444' : '#ddd'}`,
                  borderRadius: '24px',
                  resize: 'none',
                  outline: 'none',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  backgroundColor: theme === 'dark' ? '#2a2a2a' : '#ffffff',
                  color: theme === 'dark' ? '#e0e0e0' : '#1a1a1a',
                  overflowY: 'auto',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  lineHeight: '1.4'
                }}
                rows={1}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                style={{
                  position: 'absolute',
                  right: '8px',
                  bottom: '8px', // Adjusted for better alignment with textarea
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: (!input.trim() || isLoading) ? (theme === 'dark' ? '#444' : '#f0f0f0') : '#007bff',
                  color: (!input.trim() || isLoading) ? (theme === 'dark' ? '#888' : '#999') : '#fff',
                  cursor: (!input.trim() || isLoading) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                  boxShadow: (!input.trim() || isLoading) ? 'none' : '0 2px 8px rgba(0, 123, 255, 0.3)'
                }}
                title="Send message (Enter)"
              >
                <Send size={18} />
              </button>
            </div>
            <div style={{
              textAlign: 'center',
              marginTop: '12px',
              fontSize: '12px',
              color: theme === 'dark' ? '#666' : '#888'
            }}>
              Press Enter to send, Shift+Enter for new line • Physics AI Assistant
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatView;
