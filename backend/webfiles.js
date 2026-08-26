// backend/webfiles.js
import { createServer } from 'http';
import { readFileSync } from 'fs';

const HOST = 'localhost';
const PORT = 3000;

const server = createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  const data = readFileSync('backend/users.json', 'utf8');
  res.end(data);
});

server.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
