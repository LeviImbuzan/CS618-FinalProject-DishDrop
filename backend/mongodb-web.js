// backend/mongodb-web.js
import { createServer } from 'http';
import { MongoClient } from 'mongodb';

const HOST = 'localhost';
const PORT = 3000;
const MONGO_URL = 'mongodb://localhost:27017';
const DB_NAME = 'mydb';

const client = new MongoClient(MONGO_URL);

// Connect to MongoDB before the server starts
try {
  await client.connect();
  console.log('Successfully connected to MongoDB');
} catch (err) {
  console.error('Connection failed:', err);
}

// async on the callback because we need to await the database query
const server = createServer(async (req, res) => {
  const db = client.db(DB_NAME);
  const usersCollection = db.collection('users');

  // await pauses this line until MongoDB returns results
  const userList = await usersCollection.find().toArray();

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(userList));
});

server.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
