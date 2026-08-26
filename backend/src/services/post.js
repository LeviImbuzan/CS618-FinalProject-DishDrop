// backend/src/services/post.js

import { Post } from '../models/post.js';

// --- Create ---
export async function createPost(title, author, content, tags) {
  const post = new Post({ title, author, content, tags });
  return await post.save();
}

// --- Core list function — all filtering goes through here ---
async function listPosts(query = {}, options = {}) {
  const sort = options.sort || { createdAt: -1 }; // newest first by default
  return await Post.find(query).sort(sort);
}

// --- Public list functions ---
export async function getAllPosts(options) {
  return await listPosts({}, options);
}

export async function getPostsByAuthor(author, options) {
  return await listPosts({ author }, options);
}

export async function getPostsByTag(tag, options) {
  return await listPosts({ tags: tag }, options);
}

// --- Get single ---
export async function getPostById(id) {
  return await Post.findById(id);
}

// --- Update ---
export async function updatePost(id, updates) {
  return await Post.findByIdAndUpdate(
    id,
    updates,
    { returnDocument: 'after' } // return the updated document, not the original
  );
}

// --- Delete ---
export async function deletePost(id) {
  return await Post.findByIdAndDelete(id);
}
