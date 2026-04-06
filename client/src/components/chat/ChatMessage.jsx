import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div style={{
      display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 12
    }}>
      <div style={{
        maxWidth: '85%', padding: '10px 14px',
        borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        background: isUser ? 'var(--accent)' : 'var(--bg)',
        color: isUser ? 'white' : 'var(--text-primary)',
        fontSize: 13, lineHeight: 1.5
      }}>
        {isUser ? (
          <span>{message.content}</span>
        ) : (
          <div className="chat-markdown" style={{ fontSize: 13 }}>
            <ReactMarkdown>{message.content || '...'}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
