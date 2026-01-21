import React, { useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { Message } from '../../../ui-logic/chat/Conversation';
import { MessageItem } from './MessageItem';

declare global {
  interface Window {
    katex?: any;
  }
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  chatId: string;
  onSuggestionClick: (text: string) => void;
}

function MessageListComponent({ messages, isLoading, chatId, onSuggestionClick }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatMessagesRef = useRef<HTMLDivElement | null>(null);

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

  // Find the latest message with scene generation
  const latestSceneMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (!msg.isUser && 
          (msg as any).sceneMetadata?.hasSceneGeneration && 
          (msg as any).sceneMetadata?.sceneAction !== 'none') {
        return msg.id;
      }
    }
    return null;
  }, [messages]);

  return (
    <div className="chat-messages" ref={chatMessagesRef}>
      {messages.length === 0 && (
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
                onClick={() => onSuggestionClick(suggestion.description)}
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

      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          showScenePreview={!message.isUser && message.id === latestSceneMessageId && (message as any).sceneMetadata?.hasSceneGeneration}
          chatId={chatId}
        />
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
  );
}

// Memoize to prevent re-renders when parent re-renders with same data
export const MessageList = memo(MessageListComponent);
