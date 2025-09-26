import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Eye,
  Settings,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Code,
  Image,
  FileText,
  Maximize2,
  Minimize2,
  ThumbsUp,
  ThumbsDown,
  Share,
  BookOpen,
  Lightbulb
} from 'lucide-react';

// Import the actual hooks
import { useConversation } from '../ui-logic/chat/Conversation';
import { useTheme } from '../contexts/ThemeContext';

function ModernChatInterface() {
  const { theme, setTheme } = useTheme();
  const [chatHistory, setChatHistory] = useState([
    {
      id: '1',
      title: 'Quantum Mechanics Basics',
      timestamp: new Date(Date.now() - 86400000),
      messages: [{
        id: 1,
        text: "Hello! I'm your Physics AI Assistant. I can help you with physics concepts, create 3D visualizations, and discuss scientific phenomena. What would you like to explore today?",
        isUser: false,
        timestamp: new Date(Date.now() - 86400000),
      }],
      category: 'quantum'
    },
    {
      id: '2',
      title: 'Newton\'s Laws Visualization',
      timestamp: new Date(Date.now() - 172800000),
      messages: [{
        id: 2,
        text: "Hello! I'm your Physics AI Assistant. I can help you with physics concepts, create 3D visualizations, and discuss scientific phenomena. What would you like to explore today?",
        isUser: false,
        timestamp: new Date(Date.now() - 172800000),
      }],
      category: 'mechanics'
    },
    {
      id: '3',
      title: 'Electromagnetic Fields',
      timestamp: new Date(Date.now() - 259200000),
      messages: [{
        id: 3,
        text: "Hello! I'm your Physics AI Assistant. I can help you with physics concepts, create 3D visualizations, and discuss scientific phenomena. What would you like to explore today?",
        isUser: false,
        timestamp: new Date(Date.now() - 259200000),
      }],
      category: 'electromagnetism'
    }
  ]);
  
  const [selectedChatId, setSelectedChatId] = useState('1');
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const previewRef = useRef(null);

  // Get current chat messages from chatHistory
  const currentChat = chatHistory.find(chat => chat.id === selectedChatId);
  const currentMessages = currentChat?.messages || [];

  const { isLoading, sendMessage, regenerateResponse, clearConversation } = useConversation({
    initialMessage: "Hello! I'm your Physics AI Assistant. I can help you with physics concepts, create 3D visualizations, and discuss scientific phenomena. What would you like to explore today?",
    chatId: selectedChatId,
    currentScene: { id: 'chat-only', objects: [] }, // Dummy scene to prevent null errors
    onSceneUpdate: () => {}, // No scene updates needed in chat view
    updateConversation: (newMessages) => {
      // Update chat history with new messages from the hook
      setChatHistory(prev => prev.map(chat =>
        chat.id === selectedChatId
          ? { ...chat, messages: newMessages }
          : chat
      ));
    }
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, scrollToBottom]);

  // Load messages when switching chats
  useEffect(() => {
    const currentChat = chatHistory.find(chat => chat.id === selectedChatId);
    if (currentChat && currentChat.messages && currentChat.messages.length > 0) {
      // Load existing messages for this chat
      // Note: This would require modifying the useConversation hook to accept initial messages
      // For now, we'll rely on the chatHistory state to display messages
    }
  }, [selectedChatId, chatHistory]);

  // Trigger KaTeX rendering when messages change
  useEffect(() => {
    const renderKaTeX = () => {
      if (window.katex && window.renderMathInElement) {
        try {
          window.renderMathInElement(document.body, {
            delimiters: [
              {left: '$$', right: '$$', display: true},
              {left: '$', right: '$', display: false}
            ],
            throwOnError: false
          });
        } catch (error) {
          console.warn('KaTeX rendering failed:', error);
        }
      }
    };

    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(renderKaTeX, 100);
    return () => clearTimeout(timeoutId);
  }, [currentMessages]);

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

  const handleNewChat = () => {
    const newChatId = Date.now().toString();
    const newChat = {
      id: newChatId,
      title: 'New Conversation',
      timestamp: new Date(),
      messages: [],
      category: 'general'
    };

    setChatHistory(prev => [newChat, ...prev]);
    setSelectedChatId(newChatId);
    clearConversation();
    setInput('');
    inputRef.current?.focus();
  };

  const handleCopyMessage = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatMessageText = (text) => {
    // Enhanced formatting with LaTeX, modern LLM styling, and better code highlighting
    let formatted = text;

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

  const filteredChats = chatHistory.filter(chat =>
    !searchQuery ||
    chat.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openPreview = (message) => {
    setSelectedMessage(message);
    setShowPreview(true);
  };

  const PreviewPanel = () => {
    if (!showPreview || !selectedMessage) return null;

    return (
      <div className="preview-panel" style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '400px',
        height: '100vh',
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        borderLeft: `1px solid ${theme === 'dark' ? '#333' : '#e5e5e5'}`,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        transform: showPreview ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease'
      }}>
        <div className="preview-header" style={{
          padding: '16px',
          borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#e5e5e5'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '16px',
            color: theme === 'dark' ? '#e0e0e0' : '#1a1a1a'
          }}>
            Message Preview
          </h3>
          <button
            onClick={() => setShowPreview(false)}
            style={{
              background: 'none',
              border: 'none',
              color: theme === 'dark' ? '#888' : '#666',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>
        <div className="preview-content" style={{
          flex: 1,
          padding: '16px',
          overflow: 'auto',
          color: theme === 'dark' ? '#e0e0e0' : '#1a1a1a'
        }}>
          <div dangerouslySetInnerHTML={{ __html: formatMessageText(selectedMessage.text) }} />
        </div>
      </div>
    );
  };

  return (
    <div className={`chat-interface ${theme}`} style={{
      height: '100vh',
      display: 'flex',
      backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa',
      color: theme === 'dark' ? '#e0e0e0' : '#1a1a1a',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <style>
        {`
          @import url('https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css');

          @keyframes typing {
            0%, 60%, 100% { transform: scale(0.8); opacity: 0.5; }
            30% { transform: scale(1.2); opacity: 1; }
          }

          /* LaTeX Support */
          .latex-block {
            font-size: 1.2em;
            text-align: center;
            margin: 20px 0;
            padding: 16px;
            background: ${theme === 'dark' ? '#1a1a1a' : '#f8f9fa'};
            border: 1px solid ${theme === 'dark' ? '#333' : '#e9ecef'};
            border-radius: 8px;
            overflow-x: auto;
          }

          /* Modern LLM Headers */
          .llm-header {
            margin: 24px 0 16px 0;
            font-weight: 700;
            line-height: 1.3;
            color: ${theme === 'dark' ? '#ffffff' : '#1a1a1a'};
          }

          .llm-header.h1 {
            font-size: 28px;
            border-bottom: 3px solid ${theme === 'dark' ? '#667eea' : '#667eea'};
            padding-bottom: 8px;
          }

          .llm-header.h2 {
            font-size: 24px;
            border-bottom: 2px solid ${theme === 'dark' ? '#764ba2' : '#764ba2'};
            padding-bottom: 6px;
          }

          .llm-header.h3 {
            font-size: 20px;
            border-bottom: 1px solid ${theme === 'dark' ? '#f093fb' : '#f093fb'};
            padding-bottom: 4px;
          }

          /* Lists */
          .llm-list-item {
            margin: 8px 0;
            padding-left: 20px;
            position: relative;
          }

          .llm-list-item:before {
            content: '•';
            color: ${theme === 'dark' ? '#667eea' : '#667eea'};
            font-weight: bold;
            position: absolute;
            left: 0;
          }

          .llm-list-item.numbered {
            counter-increment: list-counter;
          }

          .llm-list-item.numbered:before {
            content: counter(list-counter) '.';
            color: ${theme === 'dark' ? '#764ba2' : '#764ba2'};
          }

          /* Blockquotes */
          .llm-blockquote {
            border-left: 4px solid ${theme === 'dark' ? '#667eea' : '#667eea'};
            padding: 12px 16px;
            margin: 16px 0;
            background: ${theme === 'dark' ? '#1a1a1a' : '#f8f9fa'};
            border-radius: 0 8px 8px 0;
            font-style: italic;
            color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          }

          /* Code Blocks */
          .code-block-container {
            margin: 16px 0;
            border-radius: 8px;
            overflow: hidden;
            background: ${theme === 'dark' ? '#1e1e1e' : '#f8f9fa'};
            border: 1px solid ${theme === 'dark' ? '#333' : '#e9ecef'};
          }

          .json-block {
            background: ${theme === 'dark' ? '#1a1a1a' : '#f9f9f9'};
          }

          .code-block-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 16px;
            background: ${theme === 'dark' ? '#252526' : '#e9ecef'};
            border-bottom: 1px solid ${theme === 'dark' ? '#333' : '#dee2e6'};
          }

          .code-lang {
            font-size: 12px;
            font-weight: 600;
            color: ${theme === 'dark' ? '#888' : '#666'};
            text-transform: uppercase;
          }

          .copy-code-btn {
            background: none;
            border: none;
            color: ${theme === 'dark' ? '#888' : '#666'};
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            transition: all 0.2s ease;
          }

          .copy-code-btn:hover {
            background: ${theme === 'dark' ? '#333' : '#ddd'};
          }

          .code-block, .json-code {
            background: none;
            padding: 16px;
            margin: 0;
            overflow-x: auto;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
            line-height: 1.5;
            color: ${theme === 'dark' ? '#e0e0e0' : '#1a1a1a'};
          }

          .json-code {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          }

          /* Syntax Highlighting */
          .comment { color: ${theme === 'dark' ? '#6a9955' : '#008000'}; }
          .keyword { color: ${theme === 'dark' ? '#569cd6' : '#0000ff'}; font-weight: bold; }
          .literal { color: ${theme === 'dark' ? '#569cd6' : '#0000ff'}; }
          .string { color: ${theme === 'dark' ? '#ce9178' : '#a31515'}; }
          .number { color: ${theme === 'dark' ? '#b5cea8' : '#09885a'}; }

          /* JSON Syntax Highlighting */
          .json-key { color: ${theme === 'dark' ? '#9cdcfe' : '#0451a5'}; }
          .json-string { color: ${theme === 'dark' ? '#ce9178' : '#a31515'}; }
          .json-number { color: ${theme === 'dark' ? '#b5cea8' : '#09885a'}; }
          .json-boolean { color: ${theme === 'dark' ? '#569cd6' : '#0000ff'}; }
          .json-null { color: ${theme === 'dark' ? '#569cd6' : '#0000ff'}; }

          .inline-code {
            background: ${theme === 'dark' ? '#2a2a2a' : '#f1f3f4'};
            color: ${theme === 'dark' ? '#ff6b6b' : '#d73a49'};
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.9em;
          }

          .message-hover-actions {
            opacity: 0;
            transition: opacity 0.2s ease;
          }

          .message:hover .message-hover-actions {
            opacity: 1;
          }

          .chat-interface * {
            scrollbar-width: thin;
            scrollbar-color: ${theme === 'dark' ? '#444 #2a2a2a' : '#ccc #f1f1f1'};
          }

          .chat-interface *::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }

          .chat-interface *::-webkit-scrollbar-track {
            background: ${theme === 'dark' ? '#2a2a2a' : '#f1f1f1'};
          }

          .chat-interface *::-webkit-scrollbar-thumb {
            background: ${theme === 'dark' ? '#444' : '#ccc'};
            border-radius: 3px;
          }

          .chat-interface *::-webkit-scrollbar-thumb:hover {
            background: ${theme === 'dark' ? '#555' : '#bbb'};
          }

          /* Message body paragraphs */
          .message-body p {
            margin: 12px 0;
          }

          .message-body p:first-child {
            margin-top: 0;
          }

          .message-body p:last-child {
            margin-bottom: 0;
          }
        `}
      </style>

      {/* Sidebar */}
      <div className="sidebar" style={{
        width: sidebarCollapsed ? '60px' : '320px',
        backgroundColor: theme === 'dark' ? '#111111' : '#ffffff',
        borderRight: `1px solid ${theme === 'dark' ? '#222' : '#e5e5e5'}`,
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* Sidebar Header */}
        <div className="sidebar-header" style={{
          padding: '16px',
          borderBottom: `1px solid ${theme === 'dark' ? '#222' : '#e5e5e5'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '64px'
        }}>
          {!sidebarCollapsed && (
            <div>
              <h2 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '700',
                color: theme === 'dark' ? '#ffffff' : '#1a1a1a'
              }}>
                Physics AI
              </h2>
              <p style={{
                margin: '2px 0 0 0',
                fontSize: '12px',
                color: theme === 'dark' ? '#888' : '#666',
                fontWeight: '500'
              }}>
                Explore • Learn • Visualize
              </p>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: 'none',
              border: 'none',
              color: theme === 'dark' ? '#888' : '#666',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              transition: 'background 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.background = theme === 'dark' ? '#222' : '#f5f5f5'}
            onMouseOut={(e) => e.target.style.background = 'none'}
          >
            <Menu size={20} />
          </button>
        </div>

        {/* New Chat Button */}
        <div style={{ padding: sidebarCollapsed ? '12px 8px' : '16px' }}>
          <button
            onClick={handleNewChat}
            style={{
              width: '100%',
              padding: sidebarCollapsed ? '12px' : '12px 16px',
              backgroundColor: theme === 'dark' ? '#2a2a2a' : '#007bff',
              color: theme === 'dark' ? '#ffffff' : '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: theme === 'dark' ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,123,255,0.3)'
            }}
          >
            <Plus size={16} />
            {!sidebarCollapsed && 'New Conversation'}
          </button>
        </div>

        {/* Search */}
        {!sidebarCollapsed && (
          <div style={{ padding: '0 16px 16px' }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Search size={16} style={{
                position: 'absolute',
                left: '12px',
                color: theme === 'dark' ? '#666' : '#888'
              }} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
                  borderRadius: '8px',
                  backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fafafa',
                  color: theme === 'dark' ? '#e0e0e0' : '#1a1a1a',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
              />
            </div>
          </div>
        )}

        {/* Chat List */}
        <div className="chat-list" style={{
          flex: 1,
          overflowY: 'auto',
          padding: sidebarCollapsed ? '0 8px' : '0 16px'
        }}>
          {filteredChats.map(chat => (
            <div
              key={chat.id}
              onClick={() => setSelectedChatId(chat.id)}
              style={{
                padding: sidebarCollapsed ? '12px 8px' : '12px 16px',
                margin: '4px 0',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: selectedChatId === chat.id
                  ? (theme === 'dark' ? '#2a2a2a' : '#e7f3ff')
                  : 'transparent',
                border: selectedChatId === chat.id
                  ? `2px solid ${theme === 'dark' ? '#007bff' : '#007bff'}`
                  : '2px solid transparent',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              {sidebarCollapsed ? (
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#10a37f',
                  margin: '0 auto'
                }} />
              ) : (
                <div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
                    marginBottom: '4px',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {chat.title}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: theme === 'dark' ? '#888' : '#666',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>{new Date(chat.timestamp).toLocaleDateString()}</span>
                    <div style={{
                      padding: '2px 6px',
                      backgroundColor: theme === 'dark' ? '#333' : '#e9ecef',
                      borderRadius: '10px',
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      fontWeight: '600'
                    }}>
                      {chat.category}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div style={{
          padding: '16px',
          borderTop: `1px solid ${theme === 'dark' ? '#222' : '#e5e5e5'}`
        }}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              style={{
                background: 'none',
                border: 'none',
                color: theme === 'dark' ? '#888' : '#666',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '6px'
              }}
              title="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{
                background: 'none',
                border: 'none',
                color: theme === 'dark' ? '#888' : '#666',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '6px'
              }}
              title="Settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
        position: 'relative'
      }}>
        {/* Header */}
        <div className="chat-header" style={{
          padding: '16px 24px',
          borderBottom: `1px solid ${theme === 'dark' ? '#222' : '#e5e5e5'}`,
          backgroundColor: theme === 'dark' ? '#111111' : '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '72px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              <Zap size={20} />
            </div>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '700',
                color: theme === 'dark' ? '#ffffff' : '#1a1a1a'
              }}>
                Physics AI Assistant
              </h1>
              <p style={{
                margin: '2px 0 0 0',
                fontSize: '13px',
                color: theme === 'dark' ? '#888' : '#666'
              }}>
                Advanced AI for physics exploration and visualization
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowPreview(!showPreview)}
              style={{
                padding: '8px 16px',
                backgroundColor: showPreview 
                  ? (theme === 'dark' ? '#2a2a2a' : '#e7f3ff')
                  : 'transparent',
                color: theme === 'dark' ? '#ffffff' : '#007bff',
                border: `1px solid ${theme === 'dark' ? '#333' : '#007bff'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
            >
              <Eye size={16} />
              Preview
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages" style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa'
        }}>
          {currentMessages.length <= 1 && !isLoading && (
            <div className="welcome-section" style={{
              textAlign: 'center',
              maxWidth: '600px',
              margin: '0 auto',
              padding: '60px 20px'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
              }}>
                <Lightbulb size={36} color="white" />
              </div>
              <h2 style={{
                margin: '0 0 16px 0',
                fontSize: '28px',
                fontWeight: '700',
                color: theme === 'dark' ? '#ffffff' : '#1a1a1a'
              }}>
                Ready to explore physics?
              </h2>
              <p style={{
                margin: '0 0 32px 0',
                fontSize: '16px',
                color: theme === 'dark' ? '#888' : '#666',
                lineHeight: '1.6'
              }}>
                Ask me about any physics concept, request 3D visualizations, or dive deep into scientific phenomena. I'm here to help you understand the universe!
              </p>
              <div style={{
                display: 'flex',
                gap: '16px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                {[
                  { icon: BookOpen, text: "Quantum mechanics", color: "#667eea" },
                  { icon: Zap, text: "Electromagnetism", color: "#f093fb" },
                  { icon: Eye, text: "3D visualization", color: "#4facfe" }
                ].map((item, index) => (
                  <div
                    key={index}
                    onClick={() => setInput(item.text)}
                    style={{
                      padding: '12px 20px',
                      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                      border: `2px solid ${item.color}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease',
                      color: item.color,
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                  >
                    <item.icon size={16} />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentMessages.slice(1).map((message, index) => (
            <div
              key={message.id}
              className="message"
              style={{
                display: 'flex',
                marginBottom: '32px',
                alignItems: 'flex-start',
                maxWidth: '100%',
                gap: '16px'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: message.isUser
                  ? (theme === 'dark' ? '#007bff' : '#007bff')
                  : (theme === 'dark' ? '#1a1a1a' : '#f0f0f0'),
                border: message.isUser ? 'none' : `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: message.isUser ? 'white' : 'inherit',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                {message.isUser ? 'You' : <Zap size={20} />}
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    fontWeight: '700',
                    fontSize: '14px',
                    color: theme === 'dark' ? '#ffffff' : '#1a1a1a'
                  }}>
                    {message.isUser ? 'You' : 'Physics AI'}
                  </span>
                  <span style={{
                    marginLeft: '12px',
                    fontSize: '12px',
                    color: theme === 'dark' ? '#888' : '#666'
                  }}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div
                  className="message-body"
                  style={{
                    fontSize: '15px',
                    lineHeight: '1.7',
                    color: theme === 'dark' ? '#e0e0e0' : '#1a1a1a',
                    wordBreak: 'break-word'
                  }}
                  dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }}
                />
                <div
                  className="message-hover-actions"
                  style={{
                    marginTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: theme === 'dark' ? '#888' : '#666'
                  }}
                >
                  <button onClick={() => handleCopyMessage(message.text)} title="Copy" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><Copy size={16} /></button>
                  {!message.isUser && <button onClick={() => regenerateResponse(index + 1)} title="Regenerate" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><RotateCcw size={16} /></button>}
                  <button title="Like" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><ThumbsUp size={16} /></button>
                  <button title="Dislike" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><ThumbsDown size={16} /></button>
                  {message.hasPreview && <button onClick={() => openPreview(message)} title="Preview" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><Eye size={16} /></button>}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f0f0f0',
                border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Zap size={20} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', paddingTop: '10px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#888', animation: 'typing 1.2s infinite ease-in-out' }}></span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#888', animation: 'typing 1.2s infinite ease-in-out', animationDelay: '0.2s' }}></span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#888', animation: 'typing 1.2s infinite ease-in-out', animationDelay: '0.4s' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chat-input-area" style={{
          padding: '16px 24px',
          borderTop: `1px solid ${theme === 'dark' ? '#222' : '#e5e5e5'}`,
          backgroundColor: theme === 'dark' ? '#111111' : '#ffffff'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px',
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fafafa',
            border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
            borderRadius: '12px'
          }}>
            <button style={{
              background: 'none',
              border: 'none',
              color: theme === 'dark' ? '#888' : '#666',
              cursor: 'pointer',
              padding: '8px'
            }}>
              <Plus size={20} />
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about a physics concept or request a visualization..."
              rows={1}
              style={{
                flex: 1,
                border: 'none',
                backgroundColor: 'transparent',
                color: theme === 'dark' ? '#e0e0e0' : '#1a1a1a',
                fontSize: '15px',
                resize: 'none',
                outline: 'none',
                maxHeight: '150px',
                overflowY: 'auto',
                lineHeight: '1.5'
              }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              style={{
                backgroundColor: isLoading || !input.trim() ? (theme === 'dark' ? '#333' : '#e0e0e0') : '#007bff',
                color: isLoading || !input.trim() ? (theme === 'dark' ? '#888' : '#aaa') : 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s ease'
              }}
            >
              <Send size={18} />
            </button>
          </div>
          <p style={{
            textAlign: 'center',
            fontSize: '12px',
            color: theme === 'dark' ? '#666' : '#888',
            marginTop: '12px',
            marginBottom: 0
          }}>
            Physics AI may produce inaccurate information. Consider verifying important details.
          </p>
        </div>
        <PreviewPanel />
      </div>
    </div>
  );
}

export default ModernChatInterface;
