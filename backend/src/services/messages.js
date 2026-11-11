// backend/src/services/messages.js

import { Message } from '../models/message.js';

export async function createMessage({ username, content, room = 'public' }) {
  const message = new Message({ username, content, room });
  return await message.save();
}

// The latest messages in a room, returned oldest first for display
export async function getRecentMessages(room = 'public', limit = 50) {
  const newestFirst = await Message.find({ room })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return newestFirst.reverse();
}
