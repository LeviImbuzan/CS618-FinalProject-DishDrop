// backend/src/test/setupFileAfterEnv.js

import { initDatabase } from '../database/init.js';
import mongoose from 'mongoose';

beforeAll(async () => {
  await initDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
});
