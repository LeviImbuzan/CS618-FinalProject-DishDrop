// backend/src/__tests__/users.test.js

import jwt from 'jsonwebtoken';
import { expect, test, describe, beforeEach } from '@jest/globals';
import { User } from '../models/user.js';
import { createUser, loginUser } from '../services/users.js';

beforeEach(async () => {
  await User.deleteMany({});
});

describe('createUser', () => {
  test('should store a bcrypt hash, never the plain password', async () => {
    const user = await createUser({ username: 'jane', password: 'secret123' });
    const stored = await User.findById(user._id);
    expect(stored.password).not.toBe('secret123');
    expect(stored.password).toMatch(/^\$2[aby]\$/);
  });

  test('with a taken username, should fail', async () => {
    await createUser({ username: 'jane', password: 'secret123' });
    await expect(
      createUser({ username: 'jane', password: 'other' })
    ).rejects.toThrow('Username is already taken');
  });

  test('without a password, should fail', async () => {
    await expect(createUser({ username: 'jane' })).rejects.toThrow(/required/);
  });
});

describe('loginUser', () => {
  beforeEach(async () => {
    await createUser({ username: 'jane', password: 'secret123' });
  });

  test('with correct credentials, should return a signed token', async () => {
    const { token } = await loginUser({
      username: 'jane',
      password: 'secret123',
    });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    expect(payload.username).toBe('jane');
    expect(payload.userId).toBeDefined();
  });

  test('with a wrong password, should fail', async () => {
    await expect(
      loginUser({ username: 'jane', password: 'wrong' })
    ).rejects.toThrow('Invalid username or password');
  });

  test('with a query object as the username, should fail', async () => {
    await expect(
      loginUser({ username: { $ne: '' }, password: 'secret123' })
    ).rejects.toThrow('Invalid username or password');
  });

  test('with an unknown username, should fail the same way', async () => {
    await expect(
      loginUser({ username: 'ghost', password: 'secret123' })
    ).rejects.toThrow('Invalid username or password');
  });
});
