import { redisClient } from '../config/redis.js';
import { logger } from '../utils/logger.js';

class CacheService {
  /**
   * Fetch a parsed JSON object from Redis.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redisClient.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      logger.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set a JSON object in Redis with an optional TTL (default 5 minutes).
   */
  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    try {
      const stringified = JSON.stringify(value);
      await redisClient.set(key, stringified, 'EX', ttlSeconds);
    } catch (error) {
      logger.error(`Cache SET error for key ${key}:`, error);
    }
  }

  /**
   * Delete a specific key from Redis.
   */
  async del(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      logger.error(`Cache DEL error for key ${key}:`, error);
    }
  }
}

export const cacheService = new CacheService();
