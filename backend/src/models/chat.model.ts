import mongoose, { Schema, Document } from 'mongoose';
import { ObjectId } from '../types/index.js';

export interface IChatMessage extends Document {
  workspace: ObjectId;
  sender: ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace reference is required'],
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender reference is required'],
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficiently fetching chat history for a given workspace, newest first
chatMessageSchema.index({ workspace: 1, createdAt: -1 });

export const ChatMessageModel = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
