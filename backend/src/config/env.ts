import { z } from 'zod';

/**
 * Environment variable schema — validated with Zod at startup.
 * Application will refuse to start if any required variable is missing or invalid.
 *
 * Variables are added progressively per task:
 *  ✅ Task 2  — App, CORS, Rate Limit, Logging, App Version
 *  🔜 Task 3  — MongoDB (MONGODB_URI)
 *  🔜 Task 4  — Redis (REDIS_HOST, REDIS_PORT, ...)
 *  🔜 Task 5  — JWT (JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, ...)
 *  🔜 Task 6  — File Upload (UPLOAD_DIR, MAX_FILE_SIZE_MB)
 */
const envSchema = z.object({
  // ─── App ──────────────────────────────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  APP_VERSION: z.string().default('1.0.0'),

  // ─── CORS ─────────────────────────────────────────────────────────────────
  CORS_ORIGIN: z
    .string()
    .transform((val) => val.split(',').map((v) => v.trim()))
    .default('http://localhost:3000'),

  // ─── Rate Limiting ────────────────────────────────────────────────────────
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().default(500),

  // ─── Logging ──────────────────────────────────────────────────────────────
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  LOG_DIR: z.string().default('./logs'),

  // ─── MongoDB (Task 3) ─────────────────────────────────────────────────────
  MONGODB_URI: z.string().default('mongodb://localhost:27017/mini-saas'),

  // ─── Redis (Task 4) ───────────────────────────────────────────────────────
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().int().default(0),

  // ─── JWT (Task 5) ─────────────────────────────────────────────────────────
  JWT_ACCESS_SECRET: z.string().min(32).default('change-me-access-secret-minimum-32-chars!'),
  JWT_REFRESH_SECRET: z.string().min(32).default('change-me-refresh-secret-minimum-32-chars!'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // ─── File Upload (Task 6) ─────────────────────────────────────────────────
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE_MB: z.coerce.number().int().default(10),
});

export type Env = z.infer<typeof envSchema>;

const parseEnv = (): Env => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    // eslint-disable-next-line no-console
    console.error('❌ Invalid environment variables:');
    // eslint-disable-next-line no-console
    console.error(JSON.stringify(result.error.flatten().fieldErrors, null, 2));
    process.exit(1);
  }

  return result.data;
};

/**
 * Validated, typed environment configuration.
 * Import this — never access process.env directly in application code.
 *
 * @example
 * import { env } from '@config/env.js';
 * const port = env.PORT; // number, not string
 */
export const env = parseEnv();
