// backend/src/__tests__/events.test.js

import request from 'supertest';
import { expect, test, describe, beforeAll, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import app from '../app.js';
import { Event } from '../models/event.js';
import { Post } from '../models/post.js';
import { User } from '../models/user.js';
import { createUser } from '../services/users.js';
import { createPost } from '../services/post.js';
import {
  trackEvent,
  getTotalViews,
  getDailyViews,
  getAverageSessionDuration,
} from '../services/events.js';

let post;

beforeAll(async () => {
  await User.deleteMany({});
  await Post.deleteMany({});
  const user = await createUser({ username: 'chef', password: 'pass1234' });
  post = await createPost(user._id, {
    title: 'Provoleta',
    ingredients: ['provolone'],
  });
});

beforeEach(async () => {
  await Event.deleteMany({});
});

// One complete visit: a start_view and an end_view sharing a session
async function visit(start, seconds) {
  const session = `s-${start.getTime()}-${Math.random()}`;
  await trackEvent({
    post: post._id,
    session,
    action: 'start_view',
    date: start,
  });
  await trackEvent({
    post: post._id,
    session,
    action: 'end_view',
    date: new Date(start.getTime() + seconds * 1000),
  });
}

describe('trackEvent', () => {
  test('without a session, should generate one', async () => {
    const event = await trackEvent({ post: post._id, action: 'start_view' });
    expect(event.session).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe('getTotalViews', () => {
  test('should count start_view events only', async () => {
    await visit(new Date('2026-11-01T12:00:00Z'), 30);
    await visit(new Date('2026-11-02T12:00:00Z'), 60);
    expect(await getTotalViews(post._id)).toBe(2);
  });
});

describe('getDailyViews', () => {
  test('should group views by day in date order', async () => {
    await visit(new Date('2026-11-02T12:00:00Z'), 30);
    await visit(new Date('2026-11-01T12:00:00Z'), 30);
    await visit(new Date('2026-11-01T15:00:00Z'), 30);
    expect(await getDailyViews(post._id.toString())).toEqual([
      { day: '2026-11-01', views: 2 },
      { day: '2026-11-02', views: 1 },
    ]);
  });

  test('should place days in the given timezone', async () => {
    // 01:00 UTC on Nov 2 is still Nov 1 in Buenos Aires (UTC-3)
    await visit(new Date('2026-11-02T01:00:00Z'), 30);
    expect(
      await getDailyViews(post._id, 'America/Argentina/Buenos_Aires')
    ).toEqual([{ day: '2026-11-01', views: 1 }]);
  });
});

describe('getAverageSessionDuration', () => {
  test('should average complete visits in seconds', async () => {
    await visit(new Date('2026-11-01T12:00:00Z'), 30);
    await visit(new Date('2026-11-01T13:00:00Z'), 90);
    // A visit with no end_view is ignored
    await trackEvent({ post: post._id, session: 'open', action: 'start_view' });
    expect(await getAverageSessionDuration(post._id)).toBe(60);
  });

  test('with no complete visits, should return null', async () => {
    expect(await getAverageSessionDuration(post._id)).toBeNull();
  });
});

describe('events API', () => {
  test('POST /api/v1/events should record a view', async () => {
    const res = await request(app)
      .post('/api/v1/events')
      .send({ postId: post._id, action: 'start_view' });
    expect(res.status).toBe(201);
    expect(await getTotalViews(post._id)).toBe(1);
  });

  test('POST /api/v1/events for a missing post should return 404', async () => {
    const res = await request(app)
      .post('/api/v1/events')
      .send({ postId: new mongoose.Types.ObjectId(), action: 'start_view' });
    expect(res.status).toBe(404);
  });

  test('POST /api/v1/events with an unknown action should return 400', async () => {
    const res = await request(app)
      .post('/api/v1/events')
      .send({ postId: post._id, action: 'delete_everything' });
    expect(res.status).toBe(400);
  });

  test('GET /api/v1/posts/:id/stats should return all three stats', async () => {
    await visit(new Date('2026-11-01T12:00:00Z'), 40);
    const res = await request(app).get(`/api/v1/posts/${post._id}/stats`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      totalViews: 1,
      dailyViews: [{ day: '2026-11-01', views: 1 }],
      avgDurationSeconds: 40,
    });
  });
});
