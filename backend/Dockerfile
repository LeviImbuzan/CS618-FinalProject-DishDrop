# backend/Dockerfile
FROM node:24-slim

WORKDIR /app

# Copy the manifests first so Docker caches the install layer
# until package.json or package-lock.json changes
COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production
# Cloud Run sends traffic to $PORT (8080 by default); index.js reads it
EXPOSE 8080

# Plain node in production; nodemon is a dev-only tool
CMD ["node", "src/index.js"]
