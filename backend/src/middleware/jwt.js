// backend/src/middleware/jwt.js

import { expressjwt } from 'express-jwt';

// Reads "Authorization: Bearer <token>", verifies the signature with
// JWT_SECRET, and puts the decoded payload on req.auth.
// Missing or invalid tokens are rejected with 401 before the route runs.
export const requireAuth = expressjwt({
  // Read the secret per request so it is never captured before dotenv loads
  secret: () => process.env.JWT_SECRET,
  algorithms: ['HS256'],
});
