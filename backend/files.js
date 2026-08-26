// backend/files.js
import { writeFileSync, readFileSync } from 'fs';

const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
  { id: 3, name: 'Carol', email: 'carol@example.com' },
];

// JSON.stringify converts a JS object to a JSON string
// The 2 adds readable indentation
const jsonData = JSON.stringify(users, null, 2);

writeFileSync('backend/users.json', jsonData);
console.log('users.json created successfully');

const rawData = readFileSync('backend/users.json', 'utf8');

// JSON.parse converts a JSON string back to a JS object
const parsedUsers = JSON.parse(rawData);
console.log('Users read from file:');
console.log(parsedUsers);
