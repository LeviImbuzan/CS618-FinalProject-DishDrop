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
    // Likes: the IDs of the users who liked this recipe. Storing user IDs
    // (not a counter) means each user can like a recipe only once, and the
    // like count is simply the array's length.
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true, // auto-manages createdAt and updatedAt
    // Include virtual fields such as likeCount in API responses
    toJSON: { virtuals: true },
  }
);

// Computed on read, never stored, so it can't drift out of sync with likes
postSchema.virtual('likeCount').get(function () {
  return this.likes?.length ?? 0;
});

export const Post = mongoose.model('Post', postSchema);
