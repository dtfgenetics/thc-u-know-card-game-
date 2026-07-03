import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express from 'express';
import { Server } from 'socket.io';
import { env, webOrigins } from './config/env.js';
import { attachRedisAdapter } from './realtime/socketRedisAdapter.js';
import { createSessionStore } from './state/createSessionStore.js';
import { registerSocketHandlers } from './socket/handlers.js';

const serverDistDir = path.dirname(fileURLToPath(import.meta.url));

function basePath(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '/') return '';
  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withSlash.endsWith('/') ? withSlash.slice(0, -1) : withSlash;
}

function findWebDistDir(): string | undefined {
  const candidates = [
    path.resolve(env.WEB_DIST_DIR),
    path.resolve(process.cwd(), env.WEB_DIST_DIR),
    path.resolve(process.cwd(), 'apps/web/dist'),
    path.resolve(process.cwd(), '../web/dist'),
    path.resolve(serverDistDir, '../../web/dist')
  ];

  return candidates.find(candidate => fs.existsSync(path.join(candidate, 'index.html')));
}

function addWebBuild(app: express.Express): void {
  const distDir = findWebDistDir();

  if (!distDir) {
    console.warn(`Web build not found. Checked WEB_DIST_DIR=${env.WEB_DIST_DIR}.`);
    return;
  }

  const indexFile = path.join(distDir, 'index.html');
  const routeBase = basePath(env.WEB_BASE_PATH);
  const staticMount = routeBase ? `${routeBase}/` : '/';

  if (routeBase) app.get(routeBase, (_request, response) => response.redirect(301, `${routeBase}/`));

  app.use(staticMount, express.static(distDir, { index: false }));
  app.get(routeBase ? `${routeBase}/*` : '*', (_request, response) => response.sendFile(indexFile));
}

async function main() {
  const app = express();
  const allowedOrigins = webOrigins();
  const corsOrigin = allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins;

  app.use(cors({ origin: corsOrigin, credentials: true }));
  app.use(express.json());

  app.get('/healthz', (_request, response) => {
    response.status(200).json({ ok: true, service: 'thc-u-know-server' });
  });

  addWebBuild(app);

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: corsOrigin,
      credentials: true
    }
  });

  const sessionStore = createSessionStore();
  await attachRedisAdapter(io);
  registerSocketHandlers(io, sessionStore);

  server.listen(env.PORT, () => {
    console.log(`THC U Know server started on port ${env.PORT}`);
  });
}

main().catch(error => {
  console.error('Failed to start THC U Know server', error);
  process.exit(1);
});
