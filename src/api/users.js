// src/api/users.js
import { baseUrl, readError } from './config.js';

async function postCredentials(path, { username, password }, fallback) {
  const response = await fetch(`${baseUrl}/users/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) throw await readError(response, fallback);
  return await response.json();
}

export function signup(credentials) {
  return postCredentials('signup', credentials, 'Sign up failed');
}

// Resolves to { token }
export function login(credentials) {
  return postCredentials('login', credentials, 'Log in failed');
}
