# Dockerfile (project root): the frontend

# ── Stage 1: build the React app into static files ──
FROM node:24-slim AS builder

WORKDIR /app

# Vite bakes this into the JavaScript at build time, so it is a build
# argument, not a runtime environment variable
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

COPY package*.json ./
# HUSKY=0 skips installing git hooks, since there is no .git folder here
RUN HUSKY=0 npm ci

COPY . .
RUN npm run build

# ── Stage 2: serve the static files with NGINX ──
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
