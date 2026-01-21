import React, { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export function ChatInput({ input, onInputChange, onSend, isLoading }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  // Auto-resize textarea (optional enhancement)
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  return (
    <div className="chat-input-container">
      <div className="chat-input-wrapper">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask anything..."
          disabled={isLoading}
          className="chat-textarea"
          rows={1}
        />
        <button
          onClick={onSend}
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
  );
}
