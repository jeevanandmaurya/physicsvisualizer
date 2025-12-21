import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown, faTimes, faComments } from '@fortawesome/free-solid-svg-icons';
import { Send } from 'lucide-react';
import { useConversation } from '../../../ui-logic/chat/Conversation';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { useDatabase } from '../../../contexts/DatabaseContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useOverlay } from '../../../contexts/OverlayContext';
import ScenePreviewCard from './ScenePreviewCard';
import './ChatOverlay.css';

const ChatOverlay = ({
  isOpen,
  onToggle,
  scene,
  onSceneUpdate
}) => {
  const { overlayOpacity } = useTheme();
  const { 
    registerOverlay, 
    unregisterOverlay, 
    focusOverlay, 
    getZIndex, 
    focusedOverlay,
    overlays,
    toggleMinimize,
    getMinimizedPosition
  } = useOverlay();
  const dataManager = useDatabase();
  const { 
    getCurrentChat, 
    addMessage, 
    getChatForScene, 
    updateChatName,
    setCurrentView,
    navigationContext,
    selectChatSession
  } = useWorkspace();

  const overlayState = overlays.get('chat');
  const isMinimized = overlayState?.isMinimized || false;
  const isFocused = focusedOverlay === 'chat';

  const [position, setPosition] = useState(() => {
    const isMobile = window.innerWidth <= 768;
    return { 
      x: isMobile ? 10 : Math.max(60, window.innerWidth - 540), 
      y: isMobile ? 50 : 60 
    };
  });

  const [size, setSize] = useState(() => {
    const isMobile = window.innerWidth <= 768;
    return { 
      width: isMobile ? window.innerWidth - 20 : 500, 
      height: isMobile ? Math.min(window.innerHeight - 120, 600) : 600 
    };
  });

  const [previousPosition, setPreviousPosition] = useState(position);
  const [previousSize, setPreviousSize] = useState(size);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Handle window resize to keep overlay in bounds
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        setPosition(prev => ({
          x: Math.min(prev.x, window.innerWidth - 50),
          y: Math.min(prev.y, window.innerHeight - 50)
        }));
        setSize(prev => ({
          width: Math.min(prev.width, window.innerWidth - 20),
          height: Math.min(prev.height, window.innerHeight - 100)
        }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Register overlay
  useEffect(() => {
    if (isOpen) {
      registerOverlay('chat', 'chat', 1000);
      return () => unregisterOverlay('chat');
    }
  }, [isOpen, registerOverlay, unregisterOverlay]);

  // Handle minimized position
  useEffect(() => {
    if (isMinimized) {
      const minPos = getMinimizedPosition('chat');
      if (minPos) {
        setPosition(minPos);
      }
    } else {
      // When unminimizing, we might want to restore previous position
      // but Rnd handles it if we don't force it. 
      // However, since we forced it for minimization, we should restore it.
      setPosition(previousPosition);
    }
  }, [isMinimized, getMinimizedPosition]);

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMinimized) {
      setPreviousPosition(position);
      setPreviousSize(size);
    }
    toggleMinimize('chat');
  };

  // Prioritize navigationContext.linkedChatId (when navigating from chat)
  // Otherwise fall back to scene-chat link lookup
  const currentChatId = navigationContext?.linkedChatId || 
                        (scene?.id ? getChatForScene(scene.id) : null);
  const currentChat = getCurrentChat();
  const workspaceMessages = currentChat?.messages || [];

  // Sync workspace chat with overlay chat if they differ
  useEffect(() => {
    if (currentChatId && currentChatId !== currentChat?.id) {
      console.log('🔄 Syncing workspace chat to overlay chat:', currentChatId);
      selectChatSession(currentChatId);
    }
  }, [currentChatId, currentChat?.id, selectChatSession]);

  // Use the conversation hook for both messages and sending
  const { messages, isLoading, sendMessage } = useConversation({
    initialMessage: null, // Don't initialize with greeting in overlay - handled manually
    currentScene: scene,
    onSceneUpdate: onSceneUpdate,
    chatId: currentChatId || '',
    dataManager: dataManager,
    workspaceMessages: workspaceMessages as any, // Pass workspace messages as fallback
    updateConversation: null, // Don't sync back - prevents loops
    addMessageToWorkspace: addMessage, // Direct persistence function
    shouldSwitchScene: true // Switch global scene when in overlay (visualizer view)
  });

  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const messageText = input.trim();
    setInput('');

    // Send to AI (this will handle adding the message internally)
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyMessage = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatMessageText = (text) => {
    // Handle null, undefined, or empty text
    if (!text) return '';
    
    // First, try to parse the text as JSON (in case it contains the full AI response)
    let cleanText = text;
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object') {
        // If it's a structured AI response, extract the appropriate message field
        if (parsed.type === 'chat' && parsed.content) {
          cleanText = parsed.content;
          console.log('📝 Extracted content from chat response');
        } else if ((parsed.type === 'create_scene' || parsed.type === 'edit_patches') && parsed.message) {
          cleanText = parsed.message;
          console.log('📝 Extracted message from scene/patch response');
        } else if (parsed.text) {
          // Fallback for other structured responses
          cleanText = parsed.text;
          console.log('📝 Extracted text from structured response');
        }
      }
    } catch (e) {
      // Not JSON, check if it's a raw AI response that needs cleaning
      // Sometimes AI responses include metadata or formatting that should be stripped
      if (text && typeof text === 'string' && text.includes('```json') && text.includes('scene') && text.includes('objects')) {
        // This looks like a raw AI response with scene JSON - extract text before JSON blocks
        const beforeJson = text.split(/```json/)[0].trim();
        if (beforeJson) {
          cleanText = beforeJson;
          console.log('📝 Extracted text before JSON blocks from raw AI response');
        }
      }
    }

    // Enhanced formatting with LaTeX, modern LLM styling, and better code highlighting
    let formatted = cleanText || '';

    // LaTeX block equations ($$...$$) - using data attributes for reliable rendering
    formatted = formatted.replace(/\$\$([\s\S]*?)\$\$/g, (match, equation) => {
      return `<div class="latex-block" data-latex="${encodeURIComponent(equation.trim())}" data-display="true"></div>`;
    });

    // LaTeX inline equations ($...$) - using data attributes
    formatted = formatted.replace(/\$([^$\n]+)\$/g, (match, equation) => {
      return `<span class="latex-inline" data-latex="${encodeURIComponent(equation.trim())}" data-display="false"></span>`;
    });

    // Headers with modern styling
    formatted = formatted.replace(/^### (.*$)/gm, '<h3 class="llm-header h3">$1</h3>');
    formatted = formatted.replace(/^## (.*$)/gm, '<h2 class="llm-header h2">$1</h2>');
    formatted = formatted.replace(/^# (.*$)/gm, '<h1 class="llm-header h1">$1</h1>');

    // Code blocks with syntax highlighting
    formatted = formatted.replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'text';
      const highlightedCode = highlightCode(code.trim(), language);
      return `<div class="code-block-container">
        <div class="code-block-header">
          <span class="code-lang">${language}</span>
          <button class="copy-code-btn" onclick="navigator.clipboard.writeText('${code.trim().replace(/'/g, "\\'").replace(/"/g, '\\"')}')">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
              <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
            </svg>
          </button>
        </div>
        <pre class="code-block" data-lang="${language}"><code>${highlightedCode}</code></pre>
      </div>`;
    });

    // JSON code blocks (special handling)
    formatted = formatted.replace(/```json\n?([\s\S]*?)```/g, (match, jsonContent) => {
      try {
        const parsed = JSON.parse(jsonContent.trim());
        const prettyJson = JSON.stringify(parsed, null, 2);
        const highlightedJson = highlightJSON(prettyJson);
        return `<div class="code-block-container json-block">
          <div class="code-block-header">
            <span class="code-lang">json</span>
            <button class="copy-code-btn" onclick="navigator.clipboard.writeText('${jsonContent.trim().replace(/'/g, "\\'").replace(/"/g, '\\"')}')">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
              </svg>
            </button>
          </div>
          <pre class="code-block json-code"><code>${highlightedJson}</code></pre>
        </div>`;
      } catch (e) {
        // Fallback to regular code block if JSON is invalid
        return `<div class="code-block-container">
          <div class="code-block-header">
            <span class="code-lang">json</span>
            <button class="copy-code-btn" onclick="navigator.clipboard.writeText('${jsonContent.trim().replace(/'/g, "\\'").replace(/"/g, '\\"')}')">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
              </svg>
            </button>
          </div>
          <pre class="code-block" data-lang="json"><code>${jsonContent.trim()}</code></pre>
        </div>`;
      }
    });

    // Inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Bold and italic
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Lists
    formatted = formatted.replace(/^\* (.*$)/gm, '<li class="llm-list-item">$1</li>');
    formatted = formatted.replace(/^\d+\. (.*$)/gm, '<li class="llm-list-item numbered">$1</li>');

    // Blockquotes
    formatted = formatted.replace(/^> (.*$)/gm, '<blockquote class="llm-blockquote">$1</blockquote>');

    // Line breaks (but preserve them for lists and other elements)
    formatted = formatted.replace(/\n\n/g, '</p><p>');
    formatted = formatted.replace(/\n/g, '<br>');

    // Wrap in paragraph if not already wrapped
    if (!formatted.includes('<p>') && !formatted.includes('<div') && !formatted.includes('<h')) {
      formatted = `<p>${formatted}</p>`;
    }

    return formatted;
  };

  // Code highlighting function
  const highlightCode = (code, language) => {
    // Basic syntax highlighting for common languages
    let highlighted = code;

    if (language === 'javascript' || language === 'js') {
      highlighted = highlighted
        .replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>')
        .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>')
        .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|from)\b/g, '<span class="keyword">$1</span>')
        .replace(/\b(true|false|null|undefined)\b/g, '<span class="literal">$1</span>')
        .replace(/(".*?"|'.*?')/g, '<span class="string">$1</span>')
        .replace(/\b(\d+(\.\d+)?)\b/g, '<span class="number">$1</span>');
    } else if (language === 'python') {
      highlighted = highlighted
        .replace(/(#.*$)/gm, '<span class="comment">$1</span>')
        .replace(/\b(def|class|if|elif|else|for|while|import|from|return|True|False|None)\b/g, '<span class="keyword">$1</span>')
        .replace(/(".*?"|'.*?')/g, '<span class="string">$1</span>')
        .replace(/\b(\d+(\.\d+)?)\b/g, '<span class="number">$1</span>');
    }

    return highlighted;
  };

  // JSON highlighting function
  const highlightJSON = (jsonString) => {
    return jsonString
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(\.\d+)?([eE][+\-]?\d+)?)/g, (match) => {
        let cls = 'number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key';
          } else {
            cls = 'string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }
        return `<span class="json-${cls}">${match}</span>`;
      });
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      // Use requestAnimationFrame to ensure the DOM has updated and scrollHeight is correct
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Trigger KaTeX rendering when messages change or overlay opens
  useEffect(() => {
    const renderKaTeX = () => {
      if (window.katex && chatContainerRef.current) {
        try {
          // Find all elements with data-latex attribute within the chat container
          const latexElements = chatContainerRef.current.querySelectorAll('[data-latex]');
          latexElements.forEach(el => {
            const latex = decodeURIComponent(el.getAttribute('data-latex') || '');
            const displayMode = el.getAttribute('data-display') === 'true';
            
            if (latex) {
              window.katex.render(latex, el, {
                throwOnError: false,
                displayMode: displayMode
              });
              el.removeAttribute('data-latex');
            }
          });
        } catch (error) {
          console.warn('KaTeX rendering failed:', error);
        }
      }
    };

    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(renderKaTeX, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isOpen]);

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

  // Get dynamic z-index and focused state
  const currentZIndex = getZIndex('chat');

  // Back to Chat handler - navigates to the chat that created this scene
  const handleBackToChat = useCallback(() => {
    if (navigationContext?.linkedChatId) {
      // Select the chat session that created this scene
      selectChatSession(navigationContext.linkedChatId);
    }
    // Navigate back to chat view
    setCurrentView('chat');
    // Close the overlay
    onToggle();
  }, [navigationContext, selectChatSession, setCurrentView, onToggle]);

  // Check if we should show the back to chat button
  const showBackToChat = navigationContext?.fromView === 'chat' && navigationContext?.linkedChatId;

  // When overlay opens with a linked chat, select that chat in the workspace
  useEffect(() => {
    if (isOpen && navigationContext?.linkedChatId) {
      const currentSelectedChat = getCurrentChat();
      // Only select if it's not already selected (avoid unnecessary updates)
      if (currentSelectedChat?.id !== navigationContext.linkedChatId) {
        console.log('📱 ChatOverlay: Selecting linked chat from navigation:', navigationContext.linkedChatId);
        selectChatSession(navigationContext.linkedChatId);
      }
    }
  }, [isOpen, navigationContext?.linkedChatId, selectChatSession, getCurrentChat]);

  const handleOverlayClick = () => {
    focusOverlay('chat');
  };

  if (!isOpen) return null;

  return (
    <Rnd
      size={isMinimized ? { width: 200, height: 28 } : size}
      position={position}
      onDragStop={(e, d) => {
        if (!isMinimized) {
          setPosition({ x: d.x, y: d.y });
        }
      }}
      onResizeStop={(e, direction, ref, delta, newPosition) => {
        if (!isMinimized) {
          setSize({
            width: parseInt(ref.style.width),
            height: parseInt(ref.style.height),
          });
          setPosition(newPosition);
        }
      }}
      minWidth={isMinimized ? 200 : (window.innerWidth <= 768 ? Math.min(280, window.innerWidth - 20) : 400)}
      minHeight={isMinimized ? 28 : 300}
      bounds="window"
      dragHandleClassName="engine-overlay-header"
      className={`engine-overlay ${isMinimized ? 'minimized' : ''} ${isFocused ? 'focused' : ''}`}
      onMouseDown={handleOverlayClick}
      style={{
        zIndex: currentZIndex,
        '--overlay-opacity': overlayOpacity.chat
      } as React.CSSProperties}
    >
      <div className="engine-overlay-header">
        <div className="engine-overlay-title">
          <FontAwesomeIcon icon={faComments} style={{ marginRight: '8px' }} />
          AI Chat {currentChat?.name ? `- ${currentChat.name}` : ''}
        </div>
        <div className="engine-overlay-controls">
          {showBackToChat && (
            <button
              className="engine-overlay-button"
              onClick={handleBackToChat}
              title="Return to chat view"
            >
              <FontAwesomeIcon icon={faComments} />
            </button>
          )}
          <button
            className="engine-overlay-button"
            onClick={handleMinimize}
            title={isMinimized ? "Maximize" : "Minimize"}
          >
            <FontAwesomeIcon icon={isMinimized ? faChevronUp : faChevronDown} />
          </button>
          <button
            className="engine-overlay-button close"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            title="Close"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="engine-overlay-content chat-overlay-content">
          <div className="chat-container">
            {/* Messages */}
            <div className="chat-messages" ref={chatContainerRef}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.isUser ? 'user' : 'ai'}`}
                >
                  <div className="message-content">
                    <div className="message-text" dangerouslySetInnerHTML={{ __html: formatMessageText((message as any).text || (message as any).content || '') }} />
                    
                    {/* Scene Preview Card */}
                    {!message.isUser && (message as any).sceneMetadata?.hasSceneGeneration && (
                      <ScenePreviewCard 
                        message={message as any}
                        chatId={currentChatId || ''}
                      />
                    )}
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
                  title="Send Message"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Rnd>
  );
};

export default ChatOverlay;
