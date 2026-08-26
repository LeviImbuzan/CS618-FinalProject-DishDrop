// backend/src/index.js

import 'dotenv/config';
import app from './app.js';
import { initDatabase } from './database/init.js';

const PORT = process.env.PORT;

await initDatabase();
console.log('Successfully connected to MongoDB');

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
