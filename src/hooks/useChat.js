// src/hooks/useChat.js
// Chat state and socket events in one hook, so components only render.
import { useCallback, useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext.jsx';

export function useChat() {
  const { socket, status } = useSocket();
  // Messages are remembered per socket, so logging out clears them
  const [state, setState] = useState({ socket: null, messages: [] });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!socket) return;
    // History replaces the list (it is resent after a reconnect);
    // live messages append to it
    const onHistory = (history) => setState({ socket, messages: history });
    const onMessage = (message) =>
      setState((prev) => ({
        socket,
        messages:
          prev.socket === socket ? [...prev.messages, message] : [message],
      }));

    socket.on('chat:history', onHistory);
    socket.on('chat:message', onMessage);
    return () => {
      socket.off('chat:history', onHistory);
      socket.off('chat:message', onMessage);
    };
  }, [socket]);

  const sendMessage = useCallback(
    async (content) => {
      if (!socket) return;
      setError(null);
      // emitWithAck waits for the server to confirm the message was saved
      const reply = await socket.emitWithAck('chat:message', { content });
      if (reply?.error) setError(reply.error);
    },
    [socket]
  );

  const messages = state.socket === socket ? state.messages : [];
  return { messages, sendMessage, status, error };
}
