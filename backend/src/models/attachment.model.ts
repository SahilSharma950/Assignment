import mongoose, { Schema, Document } from 'mongoose';
import { ObjectId } from '../types/index.js';

export interface IAttachment extends Document {
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  task: ObjectId;
  uploadedBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const attachmentSchema = new Schema<IAttachment>(
  {
    originalName: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly fetch attachments for a task
attachmentSchema.index({ task: 1, createdAt: 1 });

export const AttachmentModel = mongoose.model<IAttachment>('Attachment', attachmentSchema);
