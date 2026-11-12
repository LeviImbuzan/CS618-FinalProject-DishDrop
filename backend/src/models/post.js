// backend/src/models/post.js
// A recipe. The model keeps the name "Post" from the blog it grew out of,
// so the routes, view tracking and tests built on it keep working.

import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    // A reference to the User who wrote the recipe, set from the login token
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // One entry per ingredient, e.g. "2 cups flour"
    ingredients: {
      type: [{ type: String, trim: true }],
      validate: {
        validator: (list) => list.length > 0,
        message: 'Add at least one ingredient',
      },
    },
    // A link to a photo hosted elsewhere
    imageUrl: {
      type: String,
      trim: true,
      match: [
        /^https?:\/\/\S+$/i,
        'Image URL must start with http:// or https://',
      ],
    },
    // Preparation steps
    content: { type: String },
    tags: [String],
  },
  {
    timestamps: true, // auto-manages createdAt and updatedAt
  }
);

export const Post = mongoose.model('Post', postSchema);
