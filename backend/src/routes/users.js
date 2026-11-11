// backend/src/routes/users.js

import { createUser, loginUser } from '../services/users.js';

export function userRoutes(app) {
  // POST /api/v1/users/signup — create an account
  app.post('/api/v1/users/signup', async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await createUser({ username, password });
      res.status(201).json({ id: user._id, username: user.username });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // POST /api/v1/users/login — returns { token }
  app.post('/api/v1/users/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      res.json(await loginUser({ username, password }));
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  });
}
