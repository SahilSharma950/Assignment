import { Redis } from 'ioredis';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

/**
 * Primary Redis client instance — used for caching, sessions, pub/sub.
 * Exported as a singleton to be shared across the application.
 */
export const redisClient = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  db: env.REDIS_DB,
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number): number | null => {
    if (times > 10) {
      logger.error('Redis max retries exceeded — giving up.');
      return null;
    }
    // Exponential backoff capped at 3 seconds
    return Math.min(times * 100, 3000);
  },
  enableReadyCheck: true,
  lazyConnect: true,
});

/**
 * Dedicated Redis client for BullMQ queues.
 * BullMQ requires a separate connection to avoid blocking the main client.
 */
export const bullmqRedisClient = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  db: env.REDIS_DB,
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,    // Required by BullMQ
});

/**
 * Connects and validates the Redis client is ready.
 * Called during application bootstrap.
 */
export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    await redisClient.ping();
    logger.info(`✅ Redis connected [${env.REDIS_HOST}:${env.REDIS_PORT}]`);
  } catch (error) {
    logger.error('❌ Redis connection failed:', error);
    throw error;
  }
};

redisClient.on('error', (error: Error) => {
  logger.error('Redis client error:', error);
});

redisClient.on('reconnecting', () => {
  logger.warn('⚠️  Redis reconnecting...');
});
