// backend/src/clear-all.js
// Empties the database: users, recipes, view events and chat messages.
// Run from the backend folder:
//   npm run clear:all

import 'dotenv/config';
import mongoose from 'mongoose';
import { initDatabase } from './database/init.js';

await initDatabase();
for (const name of ['users', 'posts', 'events', 'messages']) {
  const { deletedCount } = await mongoose.connection.db
    .collection(name)
    .deleteMany({});
  console.log(`Deleted ${deletedCount} ${name}`);
}
await mongoose.disconnect();
