import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const productionBasePath = '/games/thc-u-know/';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: mode === 'production' ? env.VITE_BASE_PATH || productionBasePath : '/',
    plugins: [react()],
    server: {
      port: 5173
    }
  };
});
