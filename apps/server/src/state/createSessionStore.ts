import { shouldUseRedisStore } from '../config/env.js';
import { MemorySessionStore } from './memorySessionStore.js';
import { RedisSessionStore } from './redisStore.js';
import type { SessionStore } from './store.js';

export function createSessionStore(): SessionStore {
  if (shouldUseRedisStore()) {
    console.log('Using Redis session store.');
    return RedisSessionStore.fromEnv();
  }

  console.log('Using in-memory session store.');
  return new MemorySessionStore();
}
