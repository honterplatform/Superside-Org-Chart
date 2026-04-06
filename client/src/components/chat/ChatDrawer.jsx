import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import ChatMessage from './ChatMessage';
import SuggestedQueries from './SuggestedQueries';

export default function ChatDrawer() {
  const { setChatOpen } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setStreaming(true);

    const assistantMsg = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      const token = localStorage.getItem('spark_token');
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-10)
        })
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              fullText += parsed.text;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: fullText };
                return updated;
              });
            }
            if (parsed.error) {
              fullText += `\n\nError: ${parsed.error}`;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: fullText };
                return updated;
              });
            }
          } catch { /* skip parse errors */ }
        }
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: 'Failed to get response. Please try again.' };
        return updated;
      });
    }
    setStreaming(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;
    sendMessage(input.trim());
  };

  return (
    <div style={styles.overlay} onClick={() => setChatOpen(false)}>
      <div style={styles.panel} className="slide-in" onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>AI Assistant</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setMessages([])} style={styles.clearBtn}>Clear</button>
            <button onClick={() => setChatOpen(false)} style={styles.closeBtn}>&times;</button>
          </div>
        </div>

        <div style={styles.messages}>
          {messages.length === 0 && <SuggestedQueries onSelect={sendMessage} />}
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} />
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSubmit} style={styles.inputBar}>
          <input
            value={input} onChange={e => setInput(e.target.value)}
            placeholder="Ask about the team..."
            disabled={streaming}
            style={styles.input} autoFocus
          />
          <button type="submit" disabled={streaming || !input.trim()} style={styles.sendBtn}>
            {streaming ? '...' : '→'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 45,
    display: 'flex', justifyContent: 'flex-end'
  },
  panel: {
    width: 420, maxWidth: '100vw', height: '100%', background: 'white',
    boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column'
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 16px', borderBottom: '1px solid var(--border)'
  },
  title: { fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600 },
  clearBtn: {
    padding: '4px 10px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)', fontSize: 12, cursor: 'pointer'
  },
  closeBtn: { fontSize: 22, color: 'var(--text-secondary)', cursor: 'pointer' },
  messages: { flex: 1, overflow: 'auto', padding: 16 },
  inputBar: {
    display: 'flex', gap: 8, padding: '12px 16px',
    borderTop: '1px solid var(--border)'
  },
  input: {
    flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)', fontSize: 14
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 'var(--radius-md)',
    background: 'var(--accent)', color: 'white', fontSize: 18,
    fontWeight: 700, cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center'
  }
};
