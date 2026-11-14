// backend/src/socket.js
// Real-time features over Socket.io: the chat, and new-recipe notifications.
// Every connection must carry a valid JWT.

import jwt from 'jsonwebtoken';
import { createMessage, getRecentMessages } from './services/messages.js';

const ROOM = 'public';
const MAX_LENGTH = 500;

// The shape every client receives for a chat message
const toClient = (msg) => ({
  id: msg._id.toString(),
  username: msg.username,
  content: msg.content,
  sentAt: msg.createdAt,
});

// Each user's sockets join a private room named after their user ID, so a
// broadcast can skip one user across all their open tabs
const userRoom = (userId) => `user:${userId}`;

// --- New recipe notification ---
// Called by the create-recipe route after the recipe is saved. Broadcasts to
// every connected user except the author, who already knows.
export function broadcastNewRecipe(io, recipe, authorUsername) {
  if (!io) return; // no socket server, e.g. in route tests
  io.except(userRoom(recipe.author.toString())).emit('recipe:new', {
    id: recipe._id.toString(),
    title: recipe.title,
    author: authorUsername,
  });
}

export function handleSocket(io) {
  // Socket.io middleware runs before a connection is accepted, like
  // requireAuth does for Express routes
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Please log in to chat'));
    try {
      const { userId, username } = jwt.verify(token, process.env.JWT_SECRET);
      socket.data.user = { userId, username };
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', async (socket) => {
    const { username, userId } = socket.data.user;
    socket.join(ROOM);
    socket.join(userRoom(userId));

    // Send the recent history to this socket only
    try {
      const history = await getRecentMessages(ROOM);
      socket.emit('chat:history', history.map(toClient));
    } catch (err) {
      console.error('Failed to load chat history:', err.message);
    }

    socket.on('chat:message', async (payload, ack) => {
      const content =
        typeof payload?.content === 'string' ? payload.content.trim() : '';
      if (!content || content.length > MAX_LENGTH) {
        return ack?.({
          error: `Messages must be 1 to ${MAX_LENGTH} characters`,
        });
      }
      try {
        // The username comes from the verified token, never from the client
        const saved = await createMessage({ username, content, room: ROOM });
        // io.to(room) reaches everyone in the room, the sender included
        io.to(ROOM).emit('chat:message', toClient(saved));
        ack?.({ ok: true });
      } catch (err) {
        ack?.({ error: err.message });
      }
    });
  });
}
