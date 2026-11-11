// backend/src/services/post.js

import { Post } from '../models/post.js';
import { User } from '../models/user.js';

// --- Create ---
// The author always comes from the logged-in user, never from the request body
export async function createPost(userId, { title, content, tags }) {
  const post = new Post({ title, author: userId, content, tags });
  return await post.save();
}

// --- Core list function — all filtering goes through here ---
async function listPosts(query = {}, options = {}) {
  const sort = options.sort || { createdAt: -1 }; // newest first by default
  // populate swaps the author's ObjectId for { _id, username } in one query
  return await Post.find(query).sort(sort).populate('author', 'username');
}

// --- Public list functions ---
export async function getAllPosts(options) {
  return await listPosts({}, options);
}

export async function getPostsByAuthor(username, options) {
  const user = await User.findOne({ username });
  if (!user) return [];
  return await listPosts({ author: user._id }, options);
}

export async function getPostsByTag(tag, options) {
  return await listPosts({ tags: tag }, options);
}

// --- Get single ---
export async function getPostById(id) {
  return await Post.findById(id).populate('author', 'username');
}

// --- Update ---
// Matching on both _id and author means users can only change their own posts
export async function updatePost(userId, postId, { title, content, tags }) {
  return await Post.findOneAndUpdate(
    { _id: postId, author: userId },
    { $set: { title, content, tags } },
    { returnDocument: 'after' } // Mongoose drops undefined fields, so omitted ones stay unchanged
  );
}

// --- Delete ---
export async function deletePost(userId, postId) {
  return await Post.deleteOne({ _id: postId, author: userId });
}
