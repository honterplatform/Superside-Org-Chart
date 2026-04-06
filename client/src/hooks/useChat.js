import { useState, useCallback } from 'react';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);

  const sendMessage = useCallback(async (text) => {
    // Chat logic is in ChatDrawer component
  }, []);

  return { messages, streaming, sendMessage, setMessages };
}
