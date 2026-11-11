// src/components/ChatMessage.jsx
export default function ChatMessage({ message, isOwn }) {
  const time = new Date(message.sentAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`chat-message ${isOwn ? 'own' : ''}`}>
      <div className="chat-meta">
        <strong>{isOwn ? 'You' : message.username}</strong> · {time}
      </div>
      <div className="chat-bubble">{message.content}</div>
    </div>
  );
}
