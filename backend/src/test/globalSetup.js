// backend/src/test/globalSetup.js

import { MongoMemoryServer } from 'mongodb-memory-server';

export default async function globalSetup() {
  const mongoServer = await MongoMemoryServer.create();
  process.env.DATABASE_URL = mongoServer.getUri();
  global.__MONGOINSTANCE = mongoServer;
}
