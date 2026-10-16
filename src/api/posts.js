// src/api/posts.js
// All HTTP calls for posts live here, so components never build URLs themselves.

// In development, Vite proxies /api to the Express server (see vite.config.js).
// VITE_BACKEND_URL can override this for other environments.
const baseUrl = import.meta.env.VITE_BACKEND_URL ?? '/api/v1';

export async function getPosts() {
  const response = await fetch(`${baseUrl}/posts`);
  if (!response.ok)
    throw new Error(`Failed to load posts (${response.status})`);
  return await response.json();
}

export async function createPost({ title, author, content }) {
  const response = await fetch(`${baseUrl}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, author, content }),
  });
  if (!response.ok)
    throw new Error(`Failed to create post (${response.status})`);
  return await response.json();
}
