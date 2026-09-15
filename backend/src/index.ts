import 'express-async-errors';
import { createServer } from 'http';

import { app } from './app.js';
import { connectDatabase } from './config/database.js';
import { connectRedis, redisClient } from './config/redis.js';
import { initializeSocket } from './sockets/index.js';
import { logger } from './utils/logger.js';
import { env } from './config/env.js';

const PORT = env.PORT;

/**
 * Bootstrap the application:
 * 1. Connect to MongoDB
 * 2. Connect to Redis
 * 3. Create HTTP server
 * 4. Attach Socket.io
 * 5. Start listening
 */
async function bootstrap(): Promise<void> {
  try {
    logger.info('🚀 Bootstrapping Mini SaaS Platform...');

    await connectDatabase();
    await connectRedis();

    const httpServer = createServer(app);
    initializeSocket(httpServer);

    httpServer.listen(PORT, () => {
      logger.info(`✅ Server listening on port ${PORT} [${env.NODE_ENV}]`);
      logger.info(`📖 Swagger UI → http://localhost:${PORT}/api/docs`);
    });

    // ─── Graceful Shutdown ──────────────────────────────────────────────────
    const shutdown = async (signal: string): Promise<void> => {
      logger.warn(`Received ${signal} — shutting down gracefully...`);

      httpServer.close(async () => {
        try {
          await redisClient.quit();
          logger.info('Redis connection closed.');
          logger.info('Shutdown complete. Goodbye! 👋');
          process.exit(0);
        } catch (err) {
          logger.error('Error during shutdown:', err);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));

    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('Unhandled Promise Rejection:', reason);
      process.exit(1);
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to bootstrap application:', error);
    process.exit(1);
  }
}

void bootstrap();
