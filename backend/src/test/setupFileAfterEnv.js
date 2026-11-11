// backend/src/test/setupFileAfterEnv.js

import { initDatabase } from '../database/init.js';
import mongoose from 'mongoose';

// Tests sign real tokens, so they need a secret even without a .env file
process.env.JWT_SECRET ??= 'test-only-secret';

// Jest runs test files in parallel workers. Giving each worker its own
// database stops one file's cleanup from deleting another file's data.
const baseUrl = process.env.DATABASE_URL.replace(/\/$/, '');
process.env.DATABASE_URL = `${baseUrl}/test-${process.env.JEST_WORKER_ID}`;

beforeAll(async () => {
  await initDatabase();
  // Build indexes (like the unique username) before any test relies on them
  await mongoose.connection.syncIndexes();
});

afterAll(async () => {
  await mongoose.disconnect();
});
