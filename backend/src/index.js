// backend/src/index.js

import 'dotenv/config';
import { createServer } from './server.js';
import { initDatabase } from './database/init.js';

const PORT = process.env.PORT || 3000;

// Fail at startup rather than on the first login attempt
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Add it to backend/.env');
  process.exit(1);
}

await initDatabase();
console.log('Successfully connected to MongoDB');

const { httpServer } = createServer();
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (HTTP and WebSockets)`);
});
