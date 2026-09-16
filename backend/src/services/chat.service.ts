import { chatRepository } from '../repositories/chat.repository.js';
import { workspaceService } from './workspace.service.js';
import { IChatMessage } from '../models/chat.model.js';
import mongoose from 'mongoose';

class ChatService {
  /**
   * Creates a new chat message in a workspace.
   */
  async createMessage(workspaceId: string, content: string, userId: string): Promise<IChatMessage> {
    // Validate that the user has access to this workspace
    await workspaceService.getWorkspaceById(workspaceId, userId);

    const createData: Partial<IChatMessage> = {
      workspace: new mongoose.Types.ObjectId(workspaceId),
      sender: new mongoose.Types.ObjectId(userId),
      content,
    };

    return chatRepository.create(createData);
  }

  /**
   * Retrieves recent messages for a workspace.
   */
  async getWorkspaceMessages(workspaceId: string, userId: string, limit: number = 50): Promise<IChatMessage[]> {
    // Validate workspace access
    await workspaceService.getWorkspaceById(workspaceId, userId);

    return chatRepository.getRecentByWorkspace(workspaceId, limit);
  }
}

export const chatService = new ChatService();
