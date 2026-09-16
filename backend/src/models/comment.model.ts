import mongoose, { Schema, Document } from 'mongoose';
import { ObjectId } from '../types/index.js';

export interface IComment extends Document {
  content: string;
  task: ObjectId;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task reference is required'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly fetch comments for a task, sorted by creation date
commentSchema.index({ task: 1, createdAt: 1 });

export const CommentModel = mongoose.model<IComment>('Comment', commentSchema);
