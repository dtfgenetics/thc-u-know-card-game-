import { z } from 'zod';

const booleanFromEnv = z.preprocess(value => {
  if (typeof value !== 'string') return value;
  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'off', ''].includes(normalized)) return false;
  return value;
}, z.boolean());

function validateOriginList(value: string): boolean {
  return value
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)
    .every(origin => z.string().url().safeParse(origin).success);
}

function normalizePath(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '/') return '/';
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') && value.length > 1 ? value.slice(0, -1) : value;
}

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().int().positive().default(5174),
  WEB_ORIGIN: z.string().default('http://localhost:5173,https://dtfseeds.com,https://www.dtfseeds.com').refine(validateOriginList, {
    message: 'WEB_ORIGIN must be one or more comma-separated URL origins'
  }),
  WEB_BASE_PATH: z.string().default('/games/thc-u-know'),
  WEB_DIST_DIR: z.string().default('../web/dist'),
  SOCKET_IO_PATH: z.string().optional(),
  REDIS_URL: z.string().url().optional(),
  SESSION_TTL_SECONDS: z.coerce.number().int().positive().default(60 * 60 * 24),
  ENABLE_REDIS_ADAPTER: booleanFromEnv.default(false),
  SESSION_STORE: z.enum(['memory', 'redis']).default('memory')
});

export type ServerEnv = z.infer<typeof envSchema>;

export const env: ServerEnv = envSchema.parse(process.env);

export function webOrigins(): string[] {
  return env.WEB_ORIGIN.split(',').map(origin => origin.trim()).filter(Boolean);
}

export function socketIoPath(): string {
  if (env.SOCKET_IO_PATH) return normalizePath(env.SOCKET_IO_PATH);
  if (env.NODE_ENV === 'production') return `${trimTrailingSlash(normalizePath(env.WEB_BASE_PATH))}/socket.io`;
  return '/socket.io';
}

export function shouldUseRedisAdapter(): boolean {
  return Boolean(env.REDIS_URL && env.ENABLE_REDIS_ADAPTER);
}

export function shouldUseRedisStore(): boolean {
  return env.SESSION_STORE === 'redis';
}
