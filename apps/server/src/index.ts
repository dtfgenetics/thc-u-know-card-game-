import http from 'node:http';
import cors from 'cors';
import express from 'express';
import { Server } from 'socket.io';
import { registerSocketHandlers } from './socket/handlers.js';

const app = express();
const port = Number(process.env.PORT ?? 5174);
const webOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:5173';

app.use(cors({ origin: webOrigin, credentials: true }));
app.use(express.json());

app.get('/healthz', (_request, response) => {
  response.status(200).json({ ok: true, service: 'thc-u-know-server' });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: webOrigin,
    credentials: true
  }
});

registerSocketHandlers(io);

server.listen(port, () => {
  console.log(`THC U Know server listening on http://localhost:${port}`);
});
