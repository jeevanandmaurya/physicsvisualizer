// MessageContent.js (New component or defined within Conversation.js)
import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css'; // Import KaTeX CSS

const MessageContent = ({ content }) => {
  // Regex to find inline and display LaTeX
  // Inline: $...$ (non-greedy)
  // Display: $$...$$ (non-greedy)
  // We need to handle escaped dollars \$ too if we want to be robust.
  // For simplicity, let's first target unescaped $ and $$.
  const regex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g;
  const parts = content.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const latex = part.substring(2, part.length - 2);
          try {
            const html = katex.renderToString(latex, {
              throwOnError: false,
              displayMode: true,
            });
            return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
          } catch (e) {
            console.error('KaTeX display error:', e);
            return <span key={index}>{part}</span>; // Fallback to raw text
          }
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const latex = part.substring(1, part.length - 1);
          try {
            const html = katex.renderToString(latex, {
              throwOnError: false,
              displayMode: false,
            });
            return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
          } catch (e) {
            console.error('KaTeX inline error:', e);
            return <span key={index}>{part}</span>; // Fallback to raw text
          }
        }
        // Render plain text parts, preserving whitespace and newlines
        // CSS 'white-space: pre-wrap;' on the message container will handle this.
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

export default MessageContent; // If in a separate file