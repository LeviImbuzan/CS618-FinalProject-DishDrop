// backend/simpleweb.js
import { createServer } from 'http';

const HOST = 'localhost';
const PORT = 3000;

const server = createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello HTTP World!');
});

server.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
