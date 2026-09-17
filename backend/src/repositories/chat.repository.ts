import { ChatMessageModel as ChatMessage, IChatMessage } from '../models/chat.model.js';
import { ObjectId } from '../types/index.js';
import mongoose from 'mongoose';

class ChatRepository {
  /**
   * Creates a new chat message.
   */
  async create(data: Partial<IChatMessage>, session?: mongoose.ClientSession): Promise<IChatMessage> {
    const options = session ? { session } : {};
    const messages = await ChatMessage.create([data], options);
    const createdMessage = messages[0];
    if (!createdMessage) throw new Error('Failed to create chat message');
    // Populate the sender immediately so it can be broadcasted with user info
    return ChatMessage.findById(createdMessage._id).populate('sender', 'name email avatar').exec() as Promise<IChatMessage>;
  }

  /**
   * Retrieves the most recent chat messages for a workspace.
   * Limits to 50 messages by default, sorted ascending by creation date for UI rendering.
   */
  async getRecentByWorkspace(workspaceId: string | ObjectId, limit: number = 50, session?: mongoose.ClientSession): Promise<IChatMessage[]> {
    let query = ChatMessage.find({ workspace: workspaceId }).sort({ createdAt: -1 }).limit(limit);
    if (session) query = query.session(session);
    const messages = await query.populate('sender', 'name email avatar');
    // Reverse the array so the oldest of the recent messages is first (standard chat flow)
    return messages.reverse();
  }

  /**
   * Deletes every chat message in the given workspace (for cascade deletes).
   */
  async deleteByWorkspace(workspaceId: string | ObjectId): Promise<void> {
    await ChatMessage.deleteMany({ workspace: workspaceId });
  }
}

export const chatRepository = new ChatRepository();
