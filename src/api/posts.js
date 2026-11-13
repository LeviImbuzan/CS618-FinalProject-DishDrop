// src/api/posts.js
// All HTTP calls for recipes live here, so components never build URLs themselves.
import { baseUrl, readError } from './config.js';

// sortBy: createdAt | likes | title, sortOrder: asc | desc
export async function getPosts({ sortBy, sortOrder } = {}) {
  const params = new URLSearchParams();
  if (sortBy) params.set('sortBy', sortBy);
  if (sortOrder) params.set('sortOrder', sortOrder);
  const response = await fetch(`${baseUrl}/posts?${params}`);
  if (!response.ok) throw await readError(response, 'Failed to load recipes');
  return await response.json();
}

export async function getPostById(postId) {
  const response = await fetch(`${baseUrl}/posts/${postId}`);
  if (!response.ok) throw await readError(response, 'Failed to load recipe');
  return await response.json();
}

const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

// The author is not sent: the backend reads it from the token
export async function createPost({ token, ...recipe }) {
  const response = await fetch(`${baseUrl}/posts`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(recipe),
  });
  if (!response.ok) throw await readError(response, 'Failed to save recipe');
  return await response.json();
}

export async function updatePost({ token, postId, ...recipe }) {
  const response = await fetch(`${baseUrl}/posts/${postId}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(recipe),
  });
  if (!response.ok) throw await readError(response, 'Failed to update recipe');
  return await response.json();
}

export async function deletePost({ token, postId }) {
  const response = await fetch(`${baseUrl}/posts/${postId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!response.ok) throw await readError(response, 'Failed to delete recipe');
}

// Like or unlike; resolves to { likeCount, liked }
export async function setLike({ token, postId, liked }) {
  const response = await fetch(`${baseUrl}/posts/${postId}/like`, {
    method: liked ? 'POST' : 'DELETE',
    headers: authHeaders(token),
  });
  if (!response.ok) throw await readError(response, 'Failed to update like');
  return await response.json();
}
