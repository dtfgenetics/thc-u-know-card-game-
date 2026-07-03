import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/games/thc-u-know/',
  plugins: [react()],
  server: {
    port: 5173
  }
});
