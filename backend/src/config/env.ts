import { z } from 'zod';

/**
 * Environment variable schema — validated with Zod at startup.
 * Application will refuse to start if any required variable is missing.
 */
const envSchema = z.object({
  // ─── App ──────────────────────────────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),

  // ─── MongoDB ──────────────────────────────────────────────────────────────
  MONGODB_URI: z.string().url().min(1),

  // ─── Redis ────────────────────────────────────────────────────────────────
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().int().default(0),

  // ─── JWT ──────────────────────────────────────────────────────────────────
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // ─── CORS ─────────────────────────────────────────────────────────────────
  CORS_ORIGIN: z
    .string()
    .transform((val) => val.split(',').map((v) => v.trim()))
    .default('http://localhost:3000'),

  // ─── File Upload ──────────────────────────────────────────────────────────
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE_MB: z.coerce.number().int().default(10),

  // ─── Rate Limiting ────────────────────────────────────────────────────────
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().default(500),

  // ─── Logging ──────────────────────────────────────────────────────────────
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  LOG_DIR: z.string().default('./logs'),
});

export type Env = z.infer<typeof envSchema>;

const parseEnv = (): Env => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    // eslint-disable-next-line no-console
    console.error('❌ Invalid environment variables:');
    // eslint-disable-next-line no-console
    console.error(result.error.flatten().fieldErrors);
    process.exit(1);
  }

  return result.data;
};

export const env = parseEnv();
