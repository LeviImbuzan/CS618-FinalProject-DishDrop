import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Forward /api requests from the Vite dev server to Express on port 3000.
    // The browser only talks to one origin, so no public port or CORS setup is needed.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
