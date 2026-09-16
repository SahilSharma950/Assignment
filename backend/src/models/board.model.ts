import mongoose, { Schema, Document, Model } from 'mongoose';
import { ObjectId } from '../types/index.js';

export interface IBoard extends Document {
  name: string;
  description?: string;
  workspace: ObjectId;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const boardSchema = new Schema<IBoard>(
  {
    name: {
      type: String,
      required: [true, 'Board name is required'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace ID is required'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly fetch boards for a specific workspace
boardSchema.index({ workspace: 1 });

export const Board: Model<IBoard> =
  mongoose.models.Board || mongoose.model<IBoard>('Board', boardSchema);
