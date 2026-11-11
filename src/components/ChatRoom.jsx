// src/components/ChatRoom.jsx
// The live chat box on the home page, shown to logged-in users.
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useChat } from '../hooks/useChat.js';
import ChatMessage from './ChatMessage.jsx';

const STATUS_LABEL = {
  waiting: 'Not connected',
  connecting: 'Connecting...',
  connected: 'Live',
  disconnected: 'Reconnecting...',
  error: 'Connection failed',
};

export default function ChatRoom() {
  const { username } = useAuth();
  const { messages, sendMessage, status, error } = useChat();
  const [draft, setDraft] = useState('');
  const listRef = useRef(null);

  // Keep the newest message in view
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages]);

  function handleSubmit(e) {
    e.preventDefault();
    const content = draft.trim();
    if (!content) return;
    sendMessage(content);
    setDraft('');
  }

  return (
    <section className="card chat-room">
      <div className="chat-header">
        <h2>Kitchen chat</h2>
        <span className={`chat-status ${status}`}>
          ● {STATUS_LABEL[status] ?? status}
        </span>
      </div>

      <div className="chat-list" ref={listRef}>
        {messages.length === 0 ? (
          <p className="meta">No messages yet. Say hello.</p>
        ) : (
          messages.map((m) => (
            <ChatMessage
              key={m.id}
              message={m}
              isOwn={m.username === username}
            />
          ))
        )}
      </div>

      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          type="text"
          aria-label="Message"
          placeholder="Type a message..."
          maxLength={500}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={status !== 'connected'}
        />
        <button
          type="submit"
          disabled={!draft.trim() || status !== 'connected'}
        >
          Send
        </button>
      </form>
      {error && <p className="error">{error}</p>}
    </section>
  );
}
