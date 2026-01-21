import React, { memo } from 'react';
import { Copy } from 'lucide-react';
import { Message } from '../../../ui-logic/chat/Conversation';
import MediaPreview, { MediaType } from './MediaPreview';

interface MessageItemProps {
  message: Message;
  showScenePreview: boolean;
  chatId: string;
}

function MessageItemComponent({ message, showScenePreview, chatId }: MessageItemProps) {
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

  return (
    <div className={`message-item ${message.isUser ? 'user' : 'ai'}`}>
      <div className="message-content">
        <div
          className="message-body"
          dangerouslySetInnerHTML={{
            __html: formatMessageText(message.text || (message as any).content || ''),
          }}
        />

        {/* Media Preview (for simulations, images, videos, etc.) */}
        {showScenePreview && (message as any).sceneMetadata?.sceneId && (
          <MediaPreview
            type="simulation"
            sceneId={(message as any).sceneMetadata.sceneId}
            sceneData={(message as any).sceneMetadata.sceneData}
            chatId={chatId}
            title={(message as any).sceneMetadata.sceneSummary?.name || 'Simulation'}
            description={(message as any).sceneMetadata.sceneAction === 'create' ? 'Created Scene' : 'Modified Scene'}
            metadata={{
              objectCount: (message as any).sceneMetadata.sceneSummary?.objectCount
            }}
          />
        )}

        {/* Media Preview from mediaContent */}
        {(message as any).mediaContent && (
          <MediaPreview
            type={(message as any).mediaContent.type as MediaType}
            src={(message as any).mediaContent.src}
            sceneId={(message as any).mediaContent.sceneId}
            chatId={chatId}
            title={(message as any).mediaContent.title}
            description={(message as any).mediaContent.description}
            autoPlay={(message as any).mediaContent.autoPlay}
            thumbnail={(message as any).mediaContent.thumbnail}
            metadata={(message as any).mediaContent.metadata}
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
  );
}

// Memoize to prevent re-renders when parent re-renders
export const MessageItem = memo(MessageItemComponent, (prevProps, nextProps) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.text === nextProps.message.text &&
    prevProps.showScenePreview === nextProps.showScenePreview &&
    prevProps.chatId === nextProps.chatId
  );
});
