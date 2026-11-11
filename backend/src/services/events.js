// backend/src/services/events.js

import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import { Event } from '../models/event.js';

export const EVENT_ACTIONS = ['start_view', 'end_view'];

// --- Record one event ---
// date is only passed by the seed script; real events are stamped "now"
export async function trackEvent({ post, session, action, date }) {
  const event = new Event({
    post,
    session: session || randomUUID(),
    action,
    date: date ?? new Date(),
  });
  return await event.save();
}

// Aggregation pipelines skip Mongoose's casting, so convert ids by hand
const toObjectId = (id) => new mongoose.Types.ObjectId(String(id));

// --- Total views: each start_view counts as one view ---
export async function getTotalViews(postId) {
  return await Event.countDocuments({ post: postId, action: 'start_view' });
}

// --- Views per calendar day, oldest first ---
// timezone (e.g. "America/Argentina/Buenos_Aires") decides where each day
// starts, so an evening view lands on the viewer's date, not the UTC date
export async function getDailyViews(postId, timezone = 'UTC') {
  const days = await Event.aggregate([
    { $match: { post: toObjectId(postId), action: 'start_view' } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$date', timezone },
        },
        views: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return days.map(({ _id, views }) => ({ day: _id, views }));
}

// --- Average seconds between a session's start_view and end_view ---
export async function getAverageSessionDuration(postId) {
  const [result] = await Event.aggregate([
    { $match: { post: toObjectId(postId) } },
    // Pair each session's two events into one document
    {
      $group: {
        _id: '$session',
        startDate: {
          $min: {
            $cond: [{ $eq: ['$action', 'start_view'] }, '$date', null],
          },
        },
        endDate: {
          $max: { $cond: [{ $eq: ['$action', 'end_view'] }, '$date', null] },
        },
      },
    },
    // Only complete visits have a duration
    { $match: { startDate: { $ne: null }, endDate: { $ne: null } } },
    {
      $group: {
        _id: null,
        avgDurationSeconds: {
          $avg: { $divide: [{ $subtract: ['$endDate', '$startDate'] }, 1000] },
        },
      },
    },
  ]);
  return result?.avgDurationSeconds ?? null;
}
