// backend/src/models/user.js

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    // Only the bcrypt hash is ever stored, never the plain-text password
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
