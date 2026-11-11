// backend/src/models/event.js

import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    // A random ID per post visit, so a start_view and its end_view can be paired
    session: { type: String, required: true },
    // "start_view" or "end_view"; a string so new event types need no migration
    action: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Every stats query filters on post and action, so index them together
eventSchema.index({ post: 1, action: 1, date: 1 });

export const Event = mongoose.model('Event', eventSchema);
