// backend/src/__tests__/likes.test.js

import request from 'supertest';
import { expect, test, describe, beforeAll, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import app from '../app.js';
import { Post } from '../models/post.js';
import { User } from '../models/user.js';
import { createUser } from '../services/users.js';
import {
  createPost,
  getAllPosts,
  likePost,
  unlikePost,
} from '../services/post.js';

let chef;
let fans;

beforeAll(async () => {
  await User.deleteMany({});
  chef = await createUser({ username: 'chef', password: 'pass1234' });
  fans = await Promise.all(
    ['ana', 'luis', 'sofia'].map((username) =>
      createUser({ username, password: 'pass1234' })
    )
  );
});

beforeEach(async () => {
  await Post.deleteMany({});
});

const recipe = (title) =>
  createPost(chef._id, { title, ingredients: ['salt'] });

describe('likePost', () => {
  test('should count each user once', async () => {
    const post = await recipe('Provoleta');
    await likePost(fans[0]._id, post._id);
    await likePost(fans[0]._id, post._id);
    const result = await likePost(fans[1]._id, post._id);
    expect(result).toEqual({ likeCount: 2, liked: true });
  });

  test('unlike should remove only that user', async () => {
    const post = await recipe('Provoleta');
    await likePost(fans[0]._id, post._id);
    await likePost(fans[1]._id, post._id);
    const result = await unlikePost(fans[0]._id, post._id);
    expect(result).toEqual({ likeCount: 1, liked: false });
  });

  test('on a missing recipe, should return null', async () => {
    expect(
      await likePost(fans[0]._id, new mongoose.Types.ObjectId())
    ).toBeNull();
  });
});

describe('sorting by likes', () => {
  beforeEach(async () => {
    const one = await recipe('One like');
    const three = await recipe('Three likes');
    await recipe('No likes');
    await likePost(fans[0]._id, one._id);
    for (const fan of fans) await likePost(fan._id, three._id);
  });

  test('ascending should put the most liked last', async () => {
    const posts = await getAllPosts({ sortBy: 'likes', sortOrder: 'asc' });
    expect(posts.map((p) => [p.title, p.likeCount])).toEqual([
      ['No likes', 0],
      ['One like', 1],
      ['Three likes', 3],
    ]);
  });

  test('descending should put the most liked first', async () => {
    const posts = await getAllPosts({ sortBy: 'likes', sortOrder: 'desc' });
    expect(posts[0].title).toBe('Three likes');
    expect(posts[0].author.username).toBe('chef');
  });
});

describe('like routes', () => {
  async function tokenFor(username) {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({ username, password: 'pass1234' });
    return res.body.token;
  }

  test('without a token, should return 401', async () => {
    const post = await recipe('Provoleta');
    const res = await request(app).post(`/api/v1/posts/${post._id}/like`);
    expect(res.status).toBe(401);
  });

  test('three users liking should show 3 likes on the recipe', async () => {
    const post = await recipe('Provoleta');
    for (const name of ['ana', 'luis', 'sofia']) {
      const res = await request(app)
        .post(`/api/v1/posts/${post._id}/like`)
        .set('Authorization', `Bearer ${await tokenFor(name)}`);
      expect(res.status).toBe(200);
    }
    const single = await request(app).get(`/api/v1/posts/${post._id}`);
    expect(single.body.likeCount).toBe(3);

    const list = await request(app).get(
      '/api/v1/posts?sortBy=likes&sortOrder=asc'
    );
    expect(list.body[0].likeCount).toBe(3);
  });
});
