import mongoose from 'mongoose';
import { DirectMessageModel, IDirectMessage } from '../models/directMessage.model.js';
import { ObjectId } from '../types/index.js';

export interface ConversationSummary {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  lastMessage: string;
  lastMessageAt: Date;
}

class DirectMessageRepository {
  /**
   * Creates a new direct message, immediately populated for socket broadcast.
   */
  async create(data: Partial<IDirectMessage>): Promise<IDirectMessage> {
    const message = await DirectMessageModel.create(data);
    return DirectMessageModel.findById(message._id)
      .populate('sender', 'name email avatar')
      .populate('recipient', 'name email avatar')
      .exec() as Promise<IDirectMessage>;
  }

  /**
   * Retrieves the message history between two users, oldest first.
   */
  async getConversation(userA: string | ObjectId, userB: string | ObjectId, limit: number = 100): Promise<IDirectMessage[]> {
    const messages = await DirectMessageModel.find({
      $or: [
        { sender: userA, recipient: userB },
        { sender: userB, recipient: userA },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'name email avatar')
      .populate('recipient', 'name email avatar');

    return messages.reverse();
  }

  /**
   * Builds the conversation list for a user: everyone they've exchanged a
   * direct message with, along with the most recent message, newest first.
   */
  async getConversationsForUser(userId: string): Promise<ConversationSummary[]> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const pipeline = [
      {
        $match: {
          $or: [{ sender: userObjectId }, { recipient: userObjectId }],
        },
      },
      { $sort: { createdAt: -1 as const } },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ['$sender', userObjectId] }, '$recipient', '$sender'],
          },
          lastMessage: { $first: '$content' },
          lastMessageAt: { $first: '$createdAt' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDoc',
        },
      },
      { $unwind: '$userDoc' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$userDoc.name',
          email: '$userDoc.email',
          avatar: '$userDoc.avatar',
          lastMessage: 1,
          lastMessageAt: 1,
        },
      },
      { $sort: { lastMessageAt: -1 as const } },
    ];

    return DirectMessageModel.aggregate(pipeline);
  }
}

export const directMessageRepository = new DirectMessageRepository();
