// backend/src/example.js

import { initDatabase } from './database/init.js';
import { Post } from './models/post.js';

await initDatabase();

const newPost = new Post({
  title: 'My First Post',
  author: 'Alice',
  content: 'Hello from Mongoose!',
  tags: ['intro', 'node'],
});

const saved = await newPost.save();
console.log('Saved:', saved);

const all = await Post.find();
console.log('All posts:', all);
