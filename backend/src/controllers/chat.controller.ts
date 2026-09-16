import { Request, Response, NextFunction } from 'express';
import { chatService } from '../services/chat.service.js';
import { AppError } from '../utils/AppError.js';

class ChatController {
  async getWorkspaceMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.params.workspaceId as string;
      if (!workspaceId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new AppError('Invalid workspace ID', 400);
      }
      
      const messages = await chatService.getWorkspaceMessages(workspaceId, req.user!.id);
      res.status(200).json({
        status: 'success',
        results: messages.length,
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const chatController = new ChatController();
