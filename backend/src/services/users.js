// backend/src/services/users.js

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';

const SALT_ROUNDS = 10;

// --- Sign up ---
export async function createUser({ username, password }) {
  if (typeof username !== 'string' || typeof password !== 'string') {
    throw new Error('Username and password are required');
  }
  if (!username || !password) {
    throw new Error('Username and password are required');
  }
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = new User({ username, password: hashedPassword });
  try {
    return await user.save();
  } catch (err) {
    // 11000 is MongoDB's duplicate key error from the unique index
    if (err.code === 11000) throw new Error('Username is already taken');
    throw err;
  }
}

// --- Log in ---
export async function loginUser({ username, password }) {
  // Reject objects like { "$ne": "" } so they never reach the database query
  if (typeof username !== 'string' || typeof password !== 'string') {
    throw new Error('Invalid username or password');
  }
  const user = await User.findOne({ username });
  // Same message for an unknown user and a wrong password, so the
  // response never reveals which usernames exist
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid username or password');
  }

  const token = jwt.sign(
    { userId: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  return { token };
}
