import { Server } from 'socket.io';
import { ITask } from '../models/task.model.js';
import { logger } from '../utils/logger.js';

class SocketService {
  private io: Server | null = null;

  init(io: Server) {
    this.io = io;
  }



  /**
   * Broadcasts to all users in a specific board room.
   */
  private emitToBoard(boardId: string, event: string, payload: any) {
    if (!this.io) {
      logger.warn('SocketService: Socket.io not initialized. Skipping emission.');
      return;
    }
    this.io.to(`board:${boardId}`).emit(event, payload);
  }

  /**
   * Emits to a specific user's private room.
   */
  emitToUser(userId: string, event: string, payload: any) {
    if (!this.io) {
      logger.warn('SocketService: Socket.io not initialized. Skipping emission.');
      return;
    }
    this.io.to(`user:${userId}`).emit(event, payload);
  }

  // Task Events
  broadcastTaskCreated(boardId: string, task: ITask) {
    this.emitToBoard(boardId, 'taskCreated', task);
  }

  broadcastTaskUpdated(boardId: string, task: ITask) {
    this.emitToBoard(boardId, 'taskUpdated', task);
  }

  broadcastTaskDeleted(boardId: string, taskId: string, listId: string) {
    this.emitToBoard(boardId, 'taskDeleted', { taskId, listId });
  }

  // Complex task moves might require updating multiple lists, but typically broadcasting the updated task is enough,
  // or a specific move event if needed by frontend optimization.
  // For now, taskUpdated can handle simple moves if we send the updated list/order.
}

export const socketService = new SocketService();
