// backend/src/__tests__/api.test.js
// Route-level tests: these go through Express, including the JWT middleware.

import request from 'supertest';
import { expect, test, describe, beforeEach } from '@jest/globals';
import app from '../app.js';
import { Post } from '../models/post.js';
import { User } from '../models/user.js';

beforeEach(async () => {
  await User.deleteMany({});
  await Post.deleteMany({});
});

async function signupAndLogin(username = 'jane', password = 'secret123') {
  await request(app).post('/api/v1/users/signup').send({ username, password });
  const res = await request(app)
    .post('/api/v1/users/login')
    .send({ username, password });
  return res.body.token;
}

describe('POST /api/v1/posts', () => {
  test('without a token, should return 401', async () => {
    const res = await request(app)
      .post('/api/v1/posts')
      .send({ title: 'Sneaky' });
    expect(res.status).toBe(401);
    expect(await Post.countDocuments()).toBe(0);
  });

  test('with a valid token, should create a post owned by that user', async () => {
    const token = await signupAndLogin();
    const res = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Provoleta',
        ingredients: ['provolone', 'oregano'],
        imageUrl: 'https://example.com/provoleta.jpg',
        author: 'someone-else',
      });
    expect(res.status).toBe(201);

    const list = await request(app).get('/api/v1/posts');
    expect(list.body[0].title).toBe('Provoleta');
    // The author in the body was ignored; the token decided it
    expect(list.body[0].author.username).toBe('jane');
    expect(list.body[0].ingredients).toEqual(['provolone', 'oregano']);
  });

  test('without ingredients, should return 400', async () => {
    const token = await signupAndLogin();
    const res = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Nothing in it' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/at least one ingredient/);
  });
});

describe('POST /api/v1/users/login', () => {
  test('with a wrong password, should return 401', async () => {
    await signupAndLogin();
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({ username: 'jane', password: 'wrong' });
    expect(res.status).toBe(401);
  });
});
