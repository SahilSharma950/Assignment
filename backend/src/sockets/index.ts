import type { Server } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

/**
 * Socket.io server instance — exported for use across the application.
 * Event handlers will be registered per feature in future tasks.
 */
export let io: SocketIOServer;

/**
 * Initializes Socket.io attached to the HTTP server.
 * Called once during application bootstrap.
 */
export const initializeSocket = (httpServer: Server): void => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60_000,
    pingInterval: 25_000,
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} — reason: ${reason}`);
    });

    socket.on('error', (error: Error) => {
      logger.error(`Socket error [${socket.id}]:`, error);
    });
  });

  logger.info('✅ Socket.io initialized');
};
