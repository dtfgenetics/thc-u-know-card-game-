import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(function configureVite(env) {
  const base = process.env.VITE_BASE_PATH || (env.command === 'build' ? '/games/thc-u-know/' : '/');

  return {
    base,
    plugins: [react()],
    server: {
      port: 5173
    }
  };
});
