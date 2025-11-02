import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Send } from 'lucide-react';
import { useConversation } from '../../../ui-logic/chat/Conversation';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { useDatabase } from '../../../contexts/DatabaseContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useOverlay } from '../../../contexts/OverlayContext';
import './ChatOverlay.css';

const ChatOverlay = ({
  isOpen,
  onToggle,
  scene,
  onSceneUpdate
}) => {
  const { overlayOpacity } = useTheme();
  const { registerOverlay, unregisterOverlay, focusOverlay, getZIndex, focusedOverlay } = useOverlay();
  const dataManager = useDatabase();
  const { getCurrentChat, addMessage, getChatForScene, updateChatName } = useWorkspace();
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 500, height: 600 });
  const [previousPosition, setPreviousPosition] = useState({ x: 100, y: 100 });
  const [previousSize, setPreviousSize] = useState({ width: 500, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const overlayRef = useRef(null);
  const messagesEndRef = useRef(null);

  const currentChatId = scene?.id ? getChatForScene(scene.id) : null;
  const currentChat = getCurrentChat();
  const workspaceMessages = currentChat?.messages || [];

  // Use the conversation hook for both messages and sending
  const { messages, isLoading, sendMessage } = useConversation({
    initialMessage: null, // Don't initialize with greeting in overlay - handled manually
    currentScene: scene,
    onSceneUpdate: onSceneUpdate,
    chatId: currentChatId || '',
    dataManager: dataManager,
    workspaceMessages: workspaceMessages as any, // Pass workspace messages as fallback
    updateConversation: null, // Don't sync back - prevents loops
    addMessageToWorkspace: addMessage // Direct persistence function
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

    // LaTeX block equations ($$...$$) - using KaTeX classes
    formatted = formatted.replace(/\$\$([\s\S]*?)\$\$/g, (match, equation) => {
      const id = `latex-block-${Math.random().toString(36).substr(2, 9)}`;
      // Use setTimeout to ensure DOM is ready for KaTeX rendering
      setTimeout(() => {
        if (window.katex && window.renderMathInElement) {
          const element = document.getElementById(id);
          if (element) {
            window.katex.render(equation.trim(), element, {
              displayMode: true,
              throwOnError: false
            });
          }
        }
      }, 0);
      return `<div id="${id}" class="latex-block">${equation.trim()}</div>`;
    });

    // LaTeX inline equations ($...$) - using KaTeX classes
    formatted = formatted.replace(/\$([^$\n]+)\$/g, (match, equation) => {
      const id = `latex-inline-${Math.random().toString(36).substr(2, 9)}`;
      setTimeout(() => {
        if (window.katex) {
          const element = document.getElementById(id);
          if (element) {
            window.katex.render(equation.trim(), element, {
              displayMode: false,
              throwOnError: false
            });
          }
        }
      }, 0);
      return `<span id="${id}" class="latex-inline">${equation.trim()}</span>`;
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Trigger KaTeX rendering when messages change or overlay opens
  useEffect(() => {
    const renderKaTeX = () => {
      if (window.katex && window.renderMathInElement) {
        try {
          // Render KaTeX in the chat overlay specifically
          const overlayElement = document.querySelector('.chat-overlay');
          if (overlayElement) {
            window.renderMathInElement(overlayElement, {
              delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false}
              ],
              throwOnError: false
            });
          }
        } catch (error) {
          console.warn('KaTeX rendering failed:', error);
        }
      }
    };

    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(renderKaTeX, 200);
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

  // Register with overlay system
  useEffect(() => {
    registerOverlay('chat-overlay', 'chat', 55);
    return () => unregisterOverlay('chat-overlay');
  }, [registerOverlay, unregisterOverlay]);

  // Get dynamic z-index and focused state
  const currentZIndex = getZIndex('chat-overlay');
  const isFocused = focusedOverlay === 'chat-overlay';

  // Focus overlay on click
  const handleOverlayClick = () => {
    focusOverlay('chat-overlay');
  };

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
    // Focus overlay first
    focusOverlay('chat-overlay');
    
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
        <div
          className={`chat-overlay-container ${isFocused ? 'focused' : ''}`}
          ref={overlayRef}
          onMouseDown={handleOverlayClick}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: `${size.width}px`,
            height: isMinimized ? '28px' : `${size.height}px`,
            cursor: isResizing ? 'nw-resize' : 'default',
            zIndex: currentZIndex,
            '--chat-bg-opacity': overlayOpacity.chat
          } as React.CSSProperties}
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
                    x: (window.innerWidth - 90) / 2, // Horizontally centered
                    y: window.innerHeight - 80 // Above status bar
                  });
                  setSize({ width: 90, height: 28 });
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
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`message ${message.isUser ? 'user' : 'ai'}`}
                    >
                      <div className="message-content">
                        <div className="message-text" dangerouslySetInnerHTML={{ __html: formatMessageText((message as any).text || (message as any).content || '') }} />
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
