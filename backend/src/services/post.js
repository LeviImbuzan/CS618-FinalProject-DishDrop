// backend/src/services/post.js

import { Post } from '../models/post.js';
import { User } from '../models/user.js';

// Drop blank lines from an ingredient list
const cleanList = (list) =>
  Array.isArray(list)
    ? list.map((item) => String(item).trim()).filter(Boolean)
    : list;

// --- Create ---
// The author always comes from the logged-in user, never from the request body
export async function createPost(
  userId,
  { title, ingredients, imageUrl, content, tags }
) {
  const post = new Post({
    title,
    author: userId,
    ingredients: cleanList(ingredients),
    imageUrl: imageUrl || undefined,
    content,
    tags,
  });
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
export async function updatePost(
  userId,
  postId,
  { title, ingredients, imageUrl, content, tags }
) {
  return await Post.findOneAndUpdate(
    { _id: postId, author: userId },
    {
      $set: {
        title,
        ingredients: cleanList(ingredients),
        imageUrl,
        content,
        tags,
      },
    },
    // Mongoose drops undefined fields, so omitted ones stay unchanged;
    // runValidators applies the schema rules to updates too
    { returnDocument: 'after', runValidators: true }
  );
}

// --- Delete ---
export async function deletePost(userId, postId) {
  return await Post.deleteOne({ _id: postId, author: userId });
}
