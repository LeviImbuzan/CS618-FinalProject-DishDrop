// backend/src/database/init.js

import mongoose from 'mongoose';

export async function initDatabase() {
  const url = process.env.DATABASE_URL || 'mongodb://localhost:27017/blogdb';
  await mongoose.connect(url);
  // Log only the host, never the full URL, which can contain the password
  console.log('Connected to MongoDB at', mongoose.connection.host);
}
