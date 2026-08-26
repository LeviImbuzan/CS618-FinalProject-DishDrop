// backend/src/app.js

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { postRoutes } from './routes/post.js';

const app = express();

// CORS must come first — before routes
app.use(cors());

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

postRoutes(app);

export default app;
