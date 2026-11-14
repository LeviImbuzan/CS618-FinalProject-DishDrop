// backend/src/__tests__/notifications.test.js
// A recipe created over HTTP should reach other users' sockets, but not
// the author's own.

import request from 'supertest';
import { io as connect } from 'socket.io-client';
import { expect, test, beforeAll, afterAll } from '@jest/globals';
import { createServer } from '../server.js';
import { Post } from '../models/post.js';
import { User } from '../models/user.js';
import { createUser, loginUser } from '../services/users.js';

let httpServer;
let io;
let url;
const clients = [];

beforeAll(async () => {
  await User.deleteMany({});
  await Post.deleteMany({});
  await createUser({ username: 'ana', password: 'pass1234' });
  await createUser({ username: 'luis', password: 'pass1234' });
  ({ httpServer, io } = createServer());
  await new Promise((resolve) => httpServer.listen(0, resolve));
  url = `http://localhost:${httpServer.address().port}`;
});

afterAll(() => {
  clients.forEach((c) => c.disconnect());
  io.close();
});

async function connectAs(username) {
  const { token } = await loginUser({ username, password: 'pass1234' });
  const client = connect(url, { auth: { token }, transports: ['websocket'] });
  clients.push(client);
  // The chat history arrives once the connection is fully set up
  await new Promise((resolve) => client.once('chat:history', resolve));
  return { client, token };
}

test('a new recipe should notify other users, not the author', async () => {
  const ana = await connectAs('ana');
  const luis = await connectAs('luis');

  let anaNotified = false;
  ana.client.on('recipe:new', () => (anaNotified = true));
  const luisNotified = new Promise((resolve) =>
    luis.client.once('recipe:new', resolve)
  );

  const res = await request(httpServer)
    .post('/api/v1/posts')
    .set('Authorization', `Bearer ${ana.token}`)
    .send({ title: 'Provoleta', ingredients: ['provolone'] });
  expect(res.status).toBe(201);

  expect(await luisNotified).toEqual({
    id: res.body._id,
    title: 'Provoleta',
    author: 'ana',
  });
  // Give a stray event time to arrive before checking the author got none
  await new Promise((resolve) => setTimeout(resolve, 200));
  expect(anaNotified).toBe(false);
});
