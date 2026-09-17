import mongoose from 'mongoose';
import { directMessageRepository, ConversationSummary } from '../repositories/directMessage.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { IDirectMessage } from '../models/directMessage.model.js';
import { BadRequestError, NotFoundError } from '../utils/AppError.js';

class DirectMessageService {
  /**
   * Sends a direct message after validating the recipient exists and isn't the sender.
   */
  async sendMessage(senderId: string, recipientId: string, content: string): Promise<IDirectMessage> {
    if (senderId === recipientId) {
      throw new BadRequestError('You cannot send a direct message to yourself');
    }

    const recipient = await userRepository.findById(recipientId);
    if (!recipient) {
      throw new NotFoundError('Recipient not found');
    }

    return directMessageRepository.create({
      sender: new mongoose.Types.ObjectId(senderId),
      recipient: new mongoose.Types.ObjectId(recipientId),
      content,
    });
  }

  /**
   * Retrieves the conversation between the current user and another user.
   */
  async getConversation(userId: string, otherUserId: string): Promise<IDirectMessage[]> {
    const otherUser = await userRepository.findById(otherUserId);
    if (!otherUser) {
      throw new NotFoundError('User not found');
    }

    return directMessageRepository.getConversation(userId, otherUserId);
  }

  /**
   * Retrieves the current user's list of direct-message conversations.
   */
  async getConversations(userId: string): Promise<ConversationSummary[]> {
    return directMessageRepository.getConversationsForUser(userId);
  }
}

export const directMessageService = new DirectMessageService();
