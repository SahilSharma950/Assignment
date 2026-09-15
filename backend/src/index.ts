import 'express-async-errors';
import { createServer } from 'http';

import { app } from './app.js';
import { logger } from './utils/logger.js';
import { env } from './config/env.js';

/**
 * Server bootstrap — Task 2 (Express only).
 *
 * Bootstrap order for this task:
 *  1. Create HTTP server
 *  2. Start listening on configured PORT
 *  3. Register graceful shutdown handlers
 *
 * Future tasks will add:
 *  - Task 3: await connectDatabase()  → MongoDB
 *  - Task 4: await connectRedis()     → Redis
 *  - Task 5: initializeSocket()       → Socket.io
 *  - Task 6: initializeQueues()       → BullMQ workers
 */
async function bootstrap(): Promise<void> {
  try {
    logger.info('🚀 Starting Mini SaaS Platform...');
    logger.info(`   Environment : ${env.NODE_ENV}`);
    logger.info(`   Port        : ${env.PORT}`);
    logger.info(`   Log level   : ${env.LOG_LEVEL}`);

    const httpServer = createServer(app);

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
      httpServer.close((err) => {
        if (err) {
          logger.error('Error closing HTTP server:', err);
          process.exit(1);
        }

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
