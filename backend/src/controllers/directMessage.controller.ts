import type { Request, Response } from 'express';
import { directMessageService } from '../services/directMessage.service.js';
import { sendSuccess } from '../utils/httpResponse.js';

export const getConversations = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const conversations = await directMessageService.getConversations(userId);
  sendSuccess(res, conversations, 'Conversations retrieved successfully');
};

export const getConversation = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const otherUserId = req.params.userId as string;
  const messages = await directMessageService.getConversation(userId, otherUserId);
  sendSuccess(res, messages, 'Conversation retrieved successfully');
};
