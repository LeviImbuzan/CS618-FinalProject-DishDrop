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

// Fields the recipe list can be sorted by
export const SORT_FIELDS = {
  createdAt: 'createdAt',
  likes: 'likeCount',
  title: 'title',
};

// --- Core list function — all filtering goes through here ---
// An aggregation pipeline, because sorting by like count needs a value
// (the size of the likes array) that only exists once it is computed.
async function listPosts(
  query = {},
  { sortBy = 'createdAt', sortOrder = 'desc' } = {}
) {
  const field = SORT_FIELDS[sortBy] ?? 'createdAt';
  const direction = sortOrder === 'asc' ? 1 : -1;

  return await Post.aggregate([
    { $match: query },
    // Count the likes on the database side
    { $addFields: { likeCount: { $size: { $ifNull: ['$likes', []] } } } },
    // Newest first breaks ties, e.g. between recipes with equal likes
    {
      $sort:
        field === 'createdAt'
          ? { createdAt: direction }
          : { [field]: direction, createdAt: -1 },
    },
    // Swap the author's ID for { _id, username }, like populate does
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        pipeline: [{ $project: { username: 1 } }],
        as: 'author',
      },
    },
    { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
  ]);
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

// --- Like and unlike ---
// $addToSet adds the user only if they aren't already in the array, so
// liking twice still counts once. $pull removes them.
async function setLike(userId, postId, liked) {
  const update = liked
    ? { $addToSet: { likes: userId } }
    : { $pull: { likes: userId } };
  const post = await Post.findByIdAndUpdate(postId, update, {
    returnDocument: 'after',
  });
  if (!post) return null;
  return { likeCount: post.likeCount, liked };
}

export function likePost(userId, postId) {
  return setLike(userId, postId, true);
}

export function unlikePost(userId, postId) {
  return setLike(userId, postId, false);
}

// --- Delete ---
export async function deletePost(userId, postId) {
  return await Post.deleteOne({ _id: postId, author: userId });
}
