// backend/src/models/post.js

import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    content: { type: String, required: true },
    tags: [String],
  },
  {
    timestamps: true, // auto-manages createdAt and updatedAt
  }
);

export const Post = mongoose.model('Post', postSchema);
