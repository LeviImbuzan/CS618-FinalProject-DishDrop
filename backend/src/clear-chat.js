// backend/src/clear-chat.js
// Deletes every chat message. Run from the backend folder:
//   npm run clear:chat

import 'dotenv/config';
import mongoose from 'mongoose';
import { initDatabase } from './database/init.js';
import { Message } from './models/message.js';

await initDatabase();
const { deletedCount } = await Message.deleteMany({});
console.log(`Deleted ${deletedCount} chat messages`);
await mongoose.disconnect();
