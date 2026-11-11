// src/api/events.js
import { baseUrl, readError } from './config.js';

// keepalive lets the request finish even while the page is being left
export async function trackEvent({ postId, session, action }) {
  const response = await fetch(`${baseUrl}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postId, session, action }),
    keepalive: true,
  });
  if (!response.ok) throw await readError(response, 'Failed to track event');
  return await response.json();
}

// Sends the browser's timezone so "a day" matches the reader's calendar
export async function getPostStats(postId) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const response = await fetch(
    `${baseUrl}/posts/${postId}/stats?timezone=${encodeURIComponent(timezone)}`
  );
  if (!response.ok) throw await readError(response, 'Failed to load stats');
  return await response.json();
}
