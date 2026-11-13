// backend/src/routes/post.js

import mongoose from 'mongoose';
import { requireAuth } from '../middleware/jwt.js';
import {
  createPost,
  getAllPosts,
  getPostsByAuthor,
  getPostsByTag,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
} from '../services/post.js';

// A malformed id would make Mongoose throw a CastError, so reject it as a 404
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

export function postRoutes(app) {
  // GET /api/v1/posts — public, with optional ?author= or ?tag= filtering
  // and ?sortBy=createdAt|likes|title&sortOrder=asc|desc
  app.get('/api/v1/posts', async (req, res) => {
    try {
      const { author, tag, sortBy, sortOrder } = req.query;
      const options = { sortBy, sortOrder };
      let posts;
      if (author) {
        posts = await getPostsByAuthor(author, options);
      } else if (tag) {
        posts = await getPostsByTag(tag, options);
      } else {
        posts = await getAllPosts(options);
      }
      res.json(posts);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/v1/posts/:id — public, single post
  app.get('/api/v1/posts/:id', async (req, res) => {
    try {
      if (!isValidId(req.params.id)) {
        return res.status(404).json({ error: 'Post not found' });
      }
      const post = await getPostById(req.params.id);
      if (!post) return res.status(404).json({ error: 'Post not found' });
      res.json(post);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/v1/posts — logged-in users only; author comes from the token
  app.post('/api/v1/posts', requireAuth, async (req, res) => {
    try {
      const { title, ingredients, imageUrl, content, tags } = req.body;
      const post = await createPost(req.auth.userId, {
        title,
        ingredients,
        imageUrl,
        content,
        tags,
      });
      res.status(201).json(post);
    } catch (err) {
      const status = err.name === 'ValidationError' ? 400 : 500;
      res.status(status).json({ error: err.message });
    }
  });

  // PATCH /api/v1/posts/:id — only the post's author can update it
  app.patch('/api/v1/posts/:id', requireAuth, async (req, res) => {
    try {
      if (!isValidId(req.params.id)) {
        return res.status(404).json({ error: 'Post not found' });
      }
      const { title, ingredients, imageUrl, content, tags } = req.body;
      const updated = await updatePost(req.auth.userId, req.params.id, {
        title,
        ingredients,
        imageUrl,
        content,
        tags,
      });
      if (!updated) return res.status(404).json({ error: 'Post not found' });
      res.json(updated);
    } catch (err) {
      const status = err.name === 'ValidationError' ? 400 : 500;
      res.status(status).json({ error: err.message });
    }
  });

  // POST /api/v1/posts/:id/like — logged-in users like a recipe
  // DELETE /api/v1/posts/:id/like — and take the like back
  for (const [method, action] of [
    ['post', likePost],
    ['delete', unlikePost],
  ]) {
    app[method]('/api/v1/posts/:id/like', requireAuth, async (req, res) => {
      try {
        if (!isValidId(req.params.id)) {
          return res.status(404).json({ error: 'Post not found' });
        }
        const result = await action(req.auth.userId, req.params.id);
        if (!result) return res.status(404).json({ error: 'Post not found' });
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
  }

  // DELETE /api/v1/posts/:id — only the post's author can delete it
  app.delete('/api/v1/posts/:id', requireAuth, async (req, res) => {
    try {
      if (!isValidId(req.params.id)) {
        return res.status(404).json({ error: 'Post not found' });
      }
      const result = await deletePost(req.auth.userId, req.params.id);
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}
