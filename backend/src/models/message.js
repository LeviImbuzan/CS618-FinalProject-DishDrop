// backend/src/models/message.js

import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    // Stored as plain text so history renders without a user lookup
    username: { type: String, required: true },
    content: { type: String, required: true, maxlength: 500 },
    room: { type: String, required: true, default: 'public' },
  },
  { timestamps: true }
);

// History loads the newest messages in a room
messageSchema.index({ room: 1, createdAt: -1 });

export const Message = mongoose.model('Message', messageSchema);
