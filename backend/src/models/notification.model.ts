import mongoose, { Schema, Document } from 'mongoose';
import { ObjectId } from '../types/index.js';

export interface INotification extends Document {
  recipient: ObjectId;
  sender?: ObjectId;
  type: 'TASK_ASSIGNED' | 'COMMENT_ADDED' | 'MENTIONED' | 'SYSTEM';
  content: string;
  entityId?: ObjectId;
  entityModel?: 'Task' | 'Comment' | 'Board' | 'Workspace';
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: ['TASK_ASSIGNED', 'COMMENT_ADDED', 'MENTIONED', 'SYSTEM'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      refPath: 'entityModel',
    },
    entityModel: {
      type: String,
      enum: ['Task', 'Comment', 'Board', 'Workspace'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index to efficiently query a user's unread/recent notifications
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

export const NotificationModel = mongoose.model<INotification>('Notification', notificationSchema);
