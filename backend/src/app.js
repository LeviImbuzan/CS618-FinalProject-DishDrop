// backend/src/app.js

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { postRoutes } from './routes/post.js';
import { userRoutes } from './routes/users.js';

const app = express();

// CORS must come first — before routes
app.use(cors());

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

postRoutes(app);
userRoutes(app);

// express-jwt reports a missing or bad token as an UnauthorizedError;
// answer with JSON instead of Express's default HTML error page
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Please log in to do that' });
  }
  // body-parser reports malformed JSON with a 400 status
  if (err.status === 400) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  next(err);
});

export default app;
