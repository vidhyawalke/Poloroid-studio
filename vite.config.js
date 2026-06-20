import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative paths so the app works when deployed to Vercel or any sub‑path
  base: './',
  // Server config is only needed for local development; Vercel serves the built static files.
  server: {
    port: 3000,
    strictPort: true,
  },
});
