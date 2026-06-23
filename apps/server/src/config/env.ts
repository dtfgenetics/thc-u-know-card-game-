import { z } from 'zod';

const booleanFromEnv = z.preprocess(value => {
  if (typeof value !== 'string') return value;
  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'off', ''].includes(normalized)) return false;
  return value;
}, z.boolean());

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().int().positive().default(5174),
  WEB_ORIGIN: z.string().url().default('http://localhost:5173'),
  REDIS_URL: z.string().url().optional(),
  SESSION_TTL_SECONDS: z.coerce.number().int().positive().default(60 * 60 * 24),
  ENABLE_REDIS_ADAPTER: booleanFromEnv.default(false),
  SESSION_STORE: z.enum(['memory', 'redis']).default('memory')
});

export type ServerEnv = z.infer<typeof envSchema>;

export const env: ServerEnv = envSchema.parse(process.env);

export function shouldUseRedisAdapter(): boolean {
  return Boolean(env.REDIS_URL && env.ENABLE_REDIS_ADAPTER);
}

export function shouldUseRedisStore(): boolean {
  return env.SESSION_STORE === 'redis';
}
