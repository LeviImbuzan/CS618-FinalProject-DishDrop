// backend/src/routes/events.js

import mongoose from 'mongoose';
import { getPostById } from '../services/post.js';
import {
  EVENT_ACTIONS,
  trackEvent,
  getTotalViews,
  getDailyViews,
  getAverageSessionDuration,
} from '../services/events.js';

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Accept only real IANA zone names like "America/New_York"
function safeTimezone(tz) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return tz;
  } catch {
    return 'UTC';
  }
}

export function eventRoutes(app) {
  // POST /api/v1/events — public, so logged-out readers count as views too
  app.post('/api/v1/events', async (req, res) => {
    try {
      const { postId, session, action } = req.body;
      if (!EVENT_ACTIONS.includes(action)) {
        return res.status(400).json({ error: 'Unknown event action' });
      }
      // Confirm the post exists so analytics never point at missing posts
      if (!isValidId(postId) || !(await getPostById(postId))) {
        return res.status(404).json({ error: 'Post not found' });
      }
      const event = await trackEvent({ post: postId, session, action });
      res.status(201).json(event);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // GET /api/v1/posts/:id/stats — total views, daily views, average read time
  app.get('/api/v1/posts/:id/stats', async (req, res) => {
    try {
      const postId = req.params.id;
      if (!isValidId(postId)) {
        return res.status(404).json({ error: 'Post not found' });
      }
      const timezone = safeTimezone(req.query.timezone || 'UTC');
      const [totalViews, dailyViews, avgDurationSeconds] = await Promise.all([
        getTotalViews(postId),
        getDailyViews(postId, timezone),
        getAverageSessionDuration(postId),
      ]);
      res.json({ postId, totalViews, dailyViews, avgDurationSeconds });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}
