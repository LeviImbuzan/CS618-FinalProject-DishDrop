// src/api/posts.js
// All HTTP calls for posts live here, so components never build URLs themselves.
import { baseUrl, readError } from './config.js';

export async function getPosts() {
  const response = await fetch(`${baseUrl}/posts`);
  if (!response.ok) throw await readError(response, 'Failed to load posts');
  return await response.json();
}

// The author is not sent: the backend reads it from the token
export async function createPost({ title, content, token }) {
  const response = await fetch(`${baseUrl}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content }),
  });
  if (!response.ok) throw await readError(response, 'Failed to create post');
  return await response.json();
}
