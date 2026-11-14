// backend/src/server.js
// One Node HTTP server carries both Express (HTTP) and Socket.io (WebSockets)
// on the same port.

import { createServer as createHttpServer } from 'node:http';
import { Server } from 'socket.io';
import app from './app.js';
import { handleSocket } from './socket.js';

export function createServer() {
  const httpServer = createHttpServer(app);
  const io = new Server(httpServer, { cors: { origin: '*' } });
  handleSocket(io);
  // Lets routes reach the socket server through req.app.get('io')
  app.set('io', io);
  return { httpServer, io };
}
