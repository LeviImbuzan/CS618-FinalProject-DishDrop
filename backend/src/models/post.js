// backend/src/models/post.js

import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    // A reference to the User who wrote the post, set from the login token
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: { type: String },
    tags: [String],
  },
  {
    timestamps: true, // auto-manages createdAt and updatedAt
  }
);

export const Post = mongoose.model('Post', postSchema);
