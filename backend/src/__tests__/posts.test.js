// backend/src/__tests__/posts.test.js

import mongoose from 'mongoose';
import { expect, test, describe, beforeEach } from '@jest/globals';
import { Post } from '../models/post.js';
import {
  createPost,
  getAllPosts,
  getPostsByAuthor,
  getPostsByTag,
  getPostById,
  updatePost,
  deletePost,
} from '../services/post.js';

// Sample data seeded before every test
const samplePosts = [
  {
    title: 'Node.js Basics',
    author: 'Alice',
    content: 'Node content',
    tags: ['node.js', 'backend'],
  },
  {
    title: 'React Intro',
    author: 'Bob',
    content: 'React content',
    tags: ['react', 'frontend'],
  },
  {
    title: 'MongoDB Guide',
    author: 'Alice',
    content: 'Mongo content',
    tags: ['mongodb', 'database'],
  },
  {
    title: 'Full Stack Setup',
    author: 'Carol',
    content: 'Fullstack content',
    tags: ['fullstack', 'setup'],
  },
];

let createdPosts = [];

// Wipe the collection and re-seed before EVERY test
beforeEach(async () => {
  await Post.deleteMany({});
  createdPosts = [];
  for (const postData of samplePosts) {
    const post = await createPost(
      postData.title,
      postData.author,
      postData.content,
      postData.tags
    );
    createdPosts.push(post);
  }
});

describe('createPost', () => {
  test('with all parameters, should succeed', async () => {
    const post = await createPost('Test Post', 'Alice', 'Content here', [
      'test',
    ]);
    const found = await Post.findById(post._id);
    expect(found.title).toBe('Test Post');
    expect(found.createdAt).toBeInstanceOf(Date);
  });

  test('without title, should fail', async () => {
    await expect(
      createPost(undefined, 'Alice', 'No title', [])
    ).rejects.toThrow(/title/i);
  });

  test('with minimal parameters, should succeed', async () => {
    const post = await createPost('Minimal', undefined, undefined, []);
    expect(post._id).toBeInstanceOf(mongoose.Types.ObjectId);
  });
});

describe('getAllPosts', () => {
  test('should return all posts', async () => {
    const posts = await getAllPosts();
    expect(posts.length).toBe(samplePosts.length);
  });
});

describe('getPostsByTag', () => {
  test('should return only posts matching the tag', async () => {
    const posts = await getPostsByTag('node.js');
    expect(posts.length).toBe(1);
    expect(posts[0].title).toBe('Node.js Basics');
  });
});

describe('getPostsByAuthor', () => {
  test('should return only posts by the given author', async () => {
    const posts = await getPostsByAuthor('Alice');
    expect(posts.length).toBe(2);
    posts.forEach((post) => expect(post.author).toBe('Alice'));
  });
});

describe('getPostById', () => {
  test('should return the correct post by ID', async () => {
    const target = createdPosts[0];
    const found = await getPostById(target._id);
    expect(found).not.toBeNull();
    expect(found._id.toString()).toBe(target._id.toString());
  });

  test('with a non-existent ID, should return null', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const found = await getPostById(fakeId);
    expect(found).toBeNull();
  });
});

describe('updatePost', () => {
  test('should update the specified field', async () => {
    const target = createdPosts[0];
    const updated = await updatePost(target._id, { title: 'Updated Title' });
    expect(updated.title).toBe('Updated Title');
    expect(updated.author).toBe(target.author);
  });

  test('with a non-existent ID, should return null', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const result = await updatePost(fakeId, { title: 'Ghost' });
    expect(result).toBeNull();
  });
});

describe('deletePost', () => {
  test('should remove an existing post', async () => {
    const target = createdPosts[0];
    await deletePost(target._id);
    const found = await getPostById(target._id);
    expect(found).toBeNull();
  });

  test('with a non-existent ID, should return null and change nothing', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const result = await deletePost(fakeId);
    expect(result).toBeNull();
    const remaining = await getAllPosts();
    expect(remaining.length).toBe(samplePosts.length);
  });
});
