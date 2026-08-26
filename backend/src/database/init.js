// backend/src/database/init.js

import mongoose from 'mongoose';

export async function initDatabase() {
  const url = process.env.DATABASE_URL || 'mongodb://localhost:27017/blogdb';
  await mongoose.connect(url);
  console.log('Connected to MongoDB:', url);
}
