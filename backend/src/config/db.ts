import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const MONGODB_OPTIONS: mongoose.ConnectOptions = {
  maxPoolSize: 10,          // Maximum connection pool size
  serverSelectionTimeoutMS: 5000,   // Fail fast if MongoDB unreachable
  socketTimeoutMS: 45000,
  bufferCommands: false,    // Disable buffering — fail immediately if not connected
};

/**
 * Establishes a MongoDB connection with retry logic.
 * Uses Mongoose connection pool for efficient resource usage.
 */
export const connectDatabase = async (): Promise<void> => {
  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      await mongoose.connect(env.MONGODB_URI, MONGODB_OPTIONS);
      logger.info(`✅ MongoDB connected [${mongoose.connection.host}]`);
      break;
    } catch (error) {
      attempt++;
      logger.warn(`MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed:`, error);

      if (attempt >= MAX_RETRIES) {
        logger.error('❌ MongoDB connection failed after max retries.');
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
  }

  mongoose.connection.on('disconnected', () => {
    logger.warn('⚠️  MongoDB disconnected — attempting to reconnect...');
  });

  mongoose.connection.on('error', (error: Error) => {
    logger.error('MongoDB connection error:', error);
  });
};

/**
 * Gracefully closes the MongoDB connection.
 * Called during application shutdown.
 */
export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed.');
};
