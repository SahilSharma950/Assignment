import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { env } from './env.js';
import { logger } from '../utils/logger.js';
import { socketService } from '../services/socket.service.js';
import { workspaceService } from '../services/workspace.service.js';
import { boardRepository } from '../repositories/board.repository.js';
import { chatService } from '../services/chat.service.js';

export function initializeSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Refresh-Token', 'X-Request-ID'],
    },
  });

  // Middleware for Authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { id: string; role?: string };
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} (User: ${socket.data.user.id})`);
    
    // Automatically join the user's private room for notifications
    socket.join(`user:${socket.data.user.id}`);

    // Handle joining a board room
    socket.on('joinBoard', async (boardId: string, callback?: (response: { status: string; error?: string }) => void) => {
      try {
        // We must verify the user has access to this board's workspace before letting them join.
        // Look up the board to get workspaceId
        const board = await boardRepository.findById(boardId);
        if (!board) {
          throw new Error('Board not found');
        }

        // Validate workspace membership
        await workspaceService.getWorkspaceById(board.workspace.toString(), socket.data.user.id);

        // Join the room
        const roomName = `board:${boardId}`;
        socket.join(roomName);
        logger.debug(`Socket ${socket.id} joined room ${roomName}`);
        
        if (callback) callback({ status: 'success' });
      } catch (error: any) {
        logger.error(`Socket ${socket.id} failed to join board ${boardId}:`, error);
        if (callback) callback({ status: 'error', error: error.message });
      }
    });

    // Handle leaving a board room
    socket.on('leaveBoard', (boardId: string) => {
      const roomName = `board:${boardId}`;
      socket.leave(roomName);
      logger.debug(`Socket ${socket.id} left room ${roomName}`);
    });

    // Handle joining a workspace room
    socket.on('joinWorkspace', async (workspaceId: string, callback?: (response: { status: string; error?: string }) => void) => {
      try {
        await workspaceService.getWorkspaceById(workspaceId, socket.data.user.id);
        const roomName = `workspace:${workspaceId}`;
        socket.join(roomName);
        logger.debug(`Socket ${socket.id} joined room ${roomName}`);
        if (callback) callback({ status: 'success' });
      } catch (error: any) {
        logger.error(`Socket ${socket.id} failed to join workspace ${workspaceId}:`, error);
        if (callback) callback({ status: 'error', error: error.message });
      }
    });

    socket.on('leaveWorkspace', (workspaceId: string) => {
      const roomName = `workspace:${workspaceId}`;
      socket.leave(roomName);
      logger.debug(`Socket ${socket.id} left room ${roomName}`);
    });

    // Handle sending a chat message
    socket.on('sendMessage', async (payload: { workspaceId: string; content: string }, callback?: (response: { status: string; error?: string }) => void) => {
      try {
        const message = await chatService.createMessage(payload.workspaceId, payload.content, socket.data.user.id);
        // Broadcast the new message to the workspace room
        io.to(`workspace:${payload.workspaceId}`).emit('newMessage', message);
        if (callback) callback({ status: 'success' });
      } catch (error: any) {
        logger.error(`Failed to send message in workspace ${payload.workspaceId}:`, error);
        if (callback) callback({ status: 'error', error: error.message });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  // Pass instance to service for broad usage
  socketService.init(io);
  
  return io;
}
