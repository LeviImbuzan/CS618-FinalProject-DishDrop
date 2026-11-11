// backend/src/__tests__/chat.test.js
// Starts the real HTTP + Socket.io server on a random port and connects
// socket.io-client instances to it, like two browser windows would.

import jwt from 'jsonwebtoken';
import { io as connect } from 'socket.io-client';
import {
  expect,
  test,
  describe,
  beforeAll,
  afterAll,
  beforeEach,
} from '@jest/globals';
import { createServer } from '../server.js';
import { Message } from '../models/message.js';

let httpServer;
let io;
let url;
const clients = [];

beforeAll(async () => {
  ({ httpServer, io } = createServer());
  await new Promise((resolve) => httpServer.listen(0, resolve));
  url = `http://localhost:${httpServer.address().port}`;
});

afterAll(async () => {
  clients.forEach((c) => c.disconnect());
  io.close();
});

beforeEach(async () => {
  await Message.deleteMany({});
});

const tokenFor = (username) =>
  jwt.sign({ userId: `id-${username}`, username }, process.env.JWT_SECRET);

// Connects and resolves once the history arrives, which means fully joined
function join(username) {
  return new Promise((resolve, reject) => {
    const client = connect(url, {
      auth: { token: tokenFor(username) },
      transports: ['websocket'],
    });
    clients.push(client);
    client.once('chat:history', (history) => resolve({ client, history }));
    client.once('connect_error', reject);
  });
}

const nextMessage = (client) =>
  new Promise((resolve) => client.once('chat:message', resolve));

describe('chat sockets', () => {
  test('without a token, should refuse the connection', async () => {
    const client = connect(url, { transports: ['websocket'] });
    clients.push(client);
    const err = await new Promise((resolve) =>
      client.once('connect_error', resolve)
    );
    expect(err.message).toBe('Please log in to chat');
  });

  test('a message should reach both users, credited to the sender', async () => {
    const { client: alice } = await join('alice');
    const { client: bob } = await join('bob');

    const aliceSees = nextMessage(alice);
    const bobSees = nextMessage(bob);
    alice.emit('chat:message', { content: 'Hola Bob' });

    expect((await aliceSees).content).toBe('Hola Bob');
    const received = await bobSees;
    expect(received.username).toBe('alice');
    expect(received.content).toBe('Hola Bob');
  });

  test('messages should be saved and replayed to new users', async () => {
    const { client: alice } = await join('alice');
    const saved = nextMessage(alice);
    alice.emit('chat:message', { content: 'First!' });
    await saved;

    const { history } = await join('carol');
    expect(history.map((m) => m.content)).toEqual(['First!']);
    expect(await Message.countDocuments()).toBe(1);
  });

  test('an empty message should be rejected', async () => {
    const { client: alice } = await join('alice');
    const reply = await alice.emitWithAck('chat:message', { content: '   ' });
    expect(reply.error).toMatch(/1 to 500/);
    expect(await Message.countDocuments()).toBe(0);
  });
});
