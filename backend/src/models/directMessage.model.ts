import mongoose, { Schema, Document } from 'mongoose';
import { ObjectId } from '../types/index.js';

export interface IDirectMessage extends Document {
  sender: ObjectId;
  recipient: ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const directMessageSchema = new Schema<IDirectMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender reference is required'],
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient reference is required'],
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

// Both directions need to be indexed — a conversation is queried regardless
// of who sent the most recent message.
directMessageSchema.index({ sender: 1, recipient: 1, createdAt: 1 });
directMessageSchema.index({ recipient: 1, sender: 1, createdAt: 1 });

export const DirectMessageModel = mongoose.model<IDirectMessage>('DirectMessage', directMessageSchema);
