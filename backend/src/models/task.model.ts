import mongoose, { Schema, Document, Model } from 'mongoose';
import { ObjectId } from '../types/index.js';

export interface ITask extends Document {
  title: string;
  description?: string;
  list: ObjectId;
  order: number;
  assignees: ObjectId[];
  dueDate?: Date;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    list: {
      type: Schema.Types.ObjectId,
      ref: 'List',
      required: [true, 'List ID is required'],
    },
    order: {
      type: Number,
      default: 0,
    },
    assignees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    dueDate: {
      type: Date,
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

// Compound index to quickly fetch and sort tasks for a specific list
taskSchema.index({ list: 1, order: 1 });

export const TaskModel: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>('Task', taskSchema);
