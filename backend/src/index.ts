import 'express-async-errors';
import { createServer } from 'http';

import { app } from './app.js';
import { logger } from './utils/logger.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { connectRedis, redisClient } from './config/redis.js';
import { initializeSocket } from './config/socket.js';

/**
 * Server bootstrap
 */
async function bootstrap(): Promise<void> {
  try {
    logger.info('🚀 Starting Mini SaaS Platform...');
    logger.info(`   Environment : ${env.NODE_ENV}`);
    logger.info(`   Port        : ${env.PORT}`);
    logger.info(`   Log level   : ${env.LOG_LEVEL}`);

    await connectRedis();
    await connectDatabase();

    const httpServer = createServer(app);
    initializeSocket(httpServer);

    httpServer.listen(env.PORT, () => {
      logger.info('─'.repeat(50));
      logger.info(`✅ Server is running!`);
      logger.info(`   API         → http://localhost:${env.PORT}/api`);
      logger.info(`   Health      → http://localhost:${env.PORT}/api/health`);
      logger.info(`   Swagger     → http://localhost:${env.PORT}/api/docs`);
      logger.info('─'.repeat(50));
    });

    // ─── Graceful Shutdown ────────────────────────────────────────────────────
    const shutdown = (signal: string) => async (): Promise<void> => {
      logger.warn(`\n⚠️  Received ${signal} — shutting down gracefully...`);

      // Stop accepting new connections
      httpServer.close(async (err) => {
        if (err) {
          logger.error('Error closing HTTP server:', err);
          process.exit(1);
        }

        await disconnectDatabase();
        await redisClient.quit();
        logger.info('✅ HTTP server closed.');
        logger.info('👋 Shutdown complete. Goodbye!');
        process.exit(0);
      });

      // Force shutdown after 30 seconds if graceful close stalls
      setTimeout(() => {
        logger.error('⏱️  Forced shutdown after timeout.');
        process.exit(1);
      }, 30_000).unref();
    };

    process.on('SIGTERM', shutdown('SIGTERM'));
    process.on('SIGINT', shutdown('SIGINT'));

    // ─── Unhandled Error Guards ───────────────────────────────────────────────
    process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
      logger.error('Unhandled Promise Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', { message: error.message, stack: error.stack });
      process.exit(1);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

void bootstrap();
