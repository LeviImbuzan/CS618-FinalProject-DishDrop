// backend/src/clear-views.js
// Deletes every recorded view event. Run from the backend folder:
//   npm run clear:views

import 'dotenv/config';
import mongoose from 'mongoose';
import { initDatabase } from './database/init.js';
import { Event } from './models/event.js';

await initDatabase();
const { deletedCount } = await Event.deleteMany({});
console.log(`Deleted ${deletedCount} view events`);
await mongoose.disconnect();
