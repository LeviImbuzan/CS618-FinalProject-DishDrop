// backend/src/__tests__/posts.test.js

import mongoose from 'mongoose';
import { expect, test, describe, beforeAll, beforeEach } from '@jest/globals';
import { Post } from '../models/post.js';
import { User } from '../models/user.js';
import { createUser } from '../services/users.js';
import {
  createPost,
  getAllPosts,
  getPostsByAuthor,
  getPostsByTag,
  getPostById,
  updatePost,
  deletePost,
} from '../services/post.js';

// Two real users, so ownership rules can be tested both ways
let alice;
let bob;

beforeAll(async () => {
  await User.deleteMany({});
  alice = await createUser({ username: 'alice', password: 'alice-pass' });
  bob = await createUser({ username: 'bob', password: 'bob-pass' });
});

// Sample data seeded before every test
const samplePosts = () => [
  {
    author: alice._id,
    title: 'Node.js Basics',
    ingredients: ['1 cup node'],
    content: 'Node content',
    tags: ['node.js', 'backend'],
  },
  {
    author: bob._id,
    title: 'React Intro',
    ingredients: ['2 tbsp react'],
    content: 'React content',
    tags: ['react', 'frontend'],
  },
  {
    author: alice._id,
    title: 'MongoDB Guide',
    ingredients: ['1 mongo'],
    content: 'Mongo content',
    tags: ['mongodb', 'database'],
  },
];

let createdPosts = [];

// Wipe the collection and re-seed before EVERY test
beforeEach(async () => {
  await Post.deleteMany({});
  createdPosts = [];
  for (const { author, ...postData } of samplePosts()) {
    createdPosts.push(await createPost(author, postData));
  }
});

describe('createPost', () => {
  test('with all parameters, should succeed', async () => {
    const post = await createPost(alice._id, {
      title: 'Test Post',
      ingredients: ['2 eggs', '1 cup flour'],
      imageUrl: 'https://example.com/pancakes.jpg',
      content: 'Content here',
      tags: ['test'],
    });
    const found = await Post.findById(post._id);
    expect(found.title).toBe('Test Post');
    expect([...found.ingredients]).toEqual(['2 eggs', '1 cup flour']);
    expect(found.imageUrl).toBe('https://example.com/pancakes.jpg');
    expect(found.author.toString()).toBe(alice._id.toString());
    expect(found.createdAt).toBeInstanceOf(Date);
  });

  test('without title, should fail', async () => {
    await expect(
      createPost(alice._id, { ingredients: ['salt'] })
    ).rejects.toThrow(/title/i);
  });

  test('without an author, should fail', async () => {
    await expect(
      createPost(undefined, { title: 'Orphan', ingredients: ['salt'] })
    ).rejects.toThrow(/author/i);
  });

  test('without ingredients, should fail', async () => {
    await expect(createPost(alice._id, { title: 'Air' })).rejects.toThrow(
      /at least one ingredient/
    );
  });

  test('with only blank ingredient lines, should fail', async () => {
    await expect(
      createPost(alice._id, { title: 'Air', ingredients: ['  ', ''] })
    ).rejects.toThrow(/at least one ingredient/);
  });

  test('should drop blank ingredient lines', async () => {
    const post = await createPost(alice._id, {
      title: 'Toast',
      ingredients: ['bread', '', '  butter  '],
    });
    expect([...post.ingredients]).toEqual(['bread', 'butter']);
  });

  test('with an image URL that is not http(s), should fail', async () => {
    await expect(
      createPost(alice._id, {
        title: 'Toast',
        ingredients: ['bread'],
        imageUrl: 'javascript:alert(1)',
      })
    ).rejects.toThrow(/Image URL/);
  });

  test('with minimal parameters, should succeed', async () => {
    const post = await createPost(alice._id, {
      title: 'Minimal',
      ingredients: ['salt'],
    });
    expect(post._id).toBeInstanceOf(mongoose.Types.ObjectId);
  });
});

describe('getAllPosts', () => {
  test('should return all posts with the author username populated', async () => {
    const posts = await getAllPosts();
    expect(posts.length).toBe(3);
    expect(posts[0].author.username).toBeDefined();
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
  test('should return only posts by the given username', async () => {
    const posts = await getPostsByAuthor('alice');
    expect(posts.length).toBe(2);
    posts.forEach((post) => expect(post.author.username).toBe('alice'));
  });

  test('with an unknown username, should return an empty list', async () => {
    expect(await getPostsByAuthor('nobody')).toEqual([]);
  });
});

describe('getPostById', () => {
  test('should return the correct post by ID', async () => {
    const target = createdPosts[0];
    const found = await getPostById(target._id);
    expect(found._id.toString()).toBe(target._id.toString());
  });

  test('with a non-existent ID, should return null', async () => {
    const found = await getPostById(new mongoose.Types.ObjectId());
    expect(found).toBeNull();
  });
});

describe('updatePost', () => {
  test('by the author, should update only the given field', async () => {
    const target = createdPosts[0];
    const updated = await updatePost(alice._id, target._id, {
      title: 'Updated Title',
    });
    expect(updated.title).toBe('Updated Title');
    expect(updated.content).toBe('Node content');
  });

  test('with an empty ingredient list, should fail', async () => {
    const target = createdPosts[0];
    await expect(
      updatePost(alice._id, target._id, { ingredients: [] })
    ).rejects.toThrow(/at least one ingredient/);
  });

  test('by another user, should change nothing', async () => {
    const target = createdPosts[0];
    const result = await updatePost(bob._id, target._id, { title: 'Hijacked' });
    expect(result).toBeNull();
    const unchanged = await Post.findById(target._id);
    expect(unchanged.title).toBe('Node.js Basics');
  });
});

describe('deletePost', () => {
  test('by the author, should remove the post', async () => {
    const target = createdPosts[0];
    const result = await deletePost(alice._id, target._id);
    expect(result.deletedCount).toBe(1);
    expect(await getPostById(target._id)).toBeNull();
  });

  test('by another user, should change nothing', async () => {
    const target = createdPosts[0];
    const result = await deletePost(bob._id, target._id);
    expect(result.deletedCount).toBe(0);
    expect(await getPostById(target._id)).not.toBeNull();
  });
});
