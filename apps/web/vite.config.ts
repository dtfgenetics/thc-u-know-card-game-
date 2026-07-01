import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/games/thc-u-know/',
  plugins: [react()],
  server: {
    port: 5173
  }
});
