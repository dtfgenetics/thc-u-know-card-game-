import http from 'node:http';
import cors from 'cors';
import express from 'express';
import { Server } from 'socket.io';
import { env } from './config/env.js';
import { attachRedisAdapter } from './realtime/socketRedisAdapter.js';
import { createSessionStore } from './state/createSessionStore.js';
import { registerSocketHandlers } from './socket/handlers.js';

async function main() {
  const app = express();

  app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
  app.use(express.json());

  app.get('/healthz', (_request, response) => {
    response.status(200).json({ ok: true, service: 'thc-u-know-server' });
  });

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: env.WEB_ORIGIN,
      credentials: true
    }
  });

  const sessionStore = createSessionStore();
  await attachRedisAdapter(io);
  registerSocketHandlers(io, sessionStore);

  server.listen(env.PORT, () => {
    console.log(`THC U Know server listening on http://localhost:${env.PORT}`);
  });
}

main().catch(error => {
  console.error('Failed to start THC U Know server', error);
  process.exit(1);
});
