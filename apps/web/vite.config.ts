import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const basePath = '/games/' + 'thc-u-know/';

export default defineConfig({
  base: basePath,
  plugins: [react()],
  server: {
    port: 5173
  }
});
