// backend/src/seed-views.js
// Adds fake view history to every existing post, so the daily views chart
// has several days of data. Run from the backend folder:
//   npm run seed:views
// Optional: npm run seed:views -- 21   (number of past days, default 14)

import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import { initDatabase } from './database/init.js';
import { Post } from './models/post.js';
import { Event } from './models/event.js';

const DAYS = Number(process.argv[2]) || 14;
const DAY_MS = 24 * 60 * 60 * 1000;

await initDatabase();

const posts = await Post.find();
if (posts.length === 0) {
  console.log('No posts found. Create a post in the app first.');
  process.exit(0);
}

const events = [];
for (const post of posts) {
  // Give each post its own popularity so the charts differ between posts
  const popularity = 3 + Math.floor(Math.random() * 10);

  // Days ago from DAYS down to 1; today is left for real views
  for (let daysAgo = DAYS; daysAgo >= 1; daysAgo--) {
    const views = Math.floor(Math.random() * popularity);
    for (let i = 0; i < views; i++) {
      const start = new Date(
        Date.now() - daysAgo * DAY_MS + Math.random() * DAY_MS * 0.9
      );
      // Readers stay between 10 seconds and 4 minutes
      const end = new Date(start.getTime() + (10 + Math.random() * 230) * 1000);
      const session = randomUUID();
      events.push(
        { post: post._id, session, action: 'start_view', date: start },
        { post: post._id, session, action: 'end_view', date: end }
      );
    }
  }
}

await Event.insertMany(events);
console.log(
  `Added ${events.length / 2} past views across ${posts.length} posts over the last ${DAYS} days`
);
await mongoose.disconnect();
