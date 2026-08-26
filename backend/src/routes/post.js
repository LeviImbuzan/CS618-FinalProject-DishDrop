// backend/src/routes/post.js

import {
  createPost,
  getAllPosts,
  getPostsByAuthor,
  getPostsByTag,
  getPostById,
  updatePost,
  deletePost,
} from '../services/post.js';

export function postRoutes(app) {
  // GET /api/v1/posts — all posts, with optional ?author= or ?tag= filtering
  app.get('/api/v1/posts', async (req, res) => {
    try {
      const { author, tag } = req.query;
      let posts;
      if (author) {
        posts = await getPostsByAuthor(author);
      } else if (tag) {
        posts = await getPostsByTag(tag);
      } else {
        posts = await getAllPosts();
      }
      res.json(posts);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/v1/posts/:id — single post
  app.get('/api/v1/posts/:id', async (req, res) => {
    try {
      const post = await getPostById(req.params.id);
      if (!post) return res.status(404).json({ error: 'Post not found' });
      res.json(post);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/v1/posts — create
  app.post('/api/v1/posts', async (req, res) => {
    try {
      const { title, author, content, tags } = req.body;
      const post = await createPost(title, author, content, tags);
      res.status(201).json(post);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PATCH /api/v1/posts/:id — update
  app.patch('/api/v1/posts/:id', async (req, res) => {
    try {
      const updated = await updatePost(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Post not found' });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE /api/v1/posts/:id — delete
  app.delete('/api/v1/posts/:id', async (req, res) => {
    try {
      await deletePost(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}
