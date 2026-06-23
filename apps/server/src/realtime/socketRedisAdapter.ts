import type { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { env, shouldUseRedisAdapter } from '../config/env.js';

export async function attachRedisAdapter(io: Server): Promise<void> {
  if (!shouldUseRedisAdapter()) {
    console.log('Socket.IO Redis adapter disabled; using single-process room broadcasts.');
    return;
  }

  if (!env.REDIS_URL) {
    console.warn('ENABLE_REDIS_ADAPTER is true, but REDIS_URL is missing. Continuing without Redis adapter.');
    return;
  }

  const pubClient = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true
  });
  const subClient = pubClient.duplicate();

  pubClient.on('error', error => console.error('Redis pub client error', error));
  subClient.on('error', error => console.error('Redis sub client error', error));

  io.adapter(createAdapter(pubClient, subClient));
  console.log('Socket.IO Redis adapter enabled.');
}
