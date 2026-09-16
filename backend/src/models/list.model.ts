import mongoose, { Schema, Document, Model } from 'mongoose';
import { ObjectId } from '../types/index.js';

export interface IList extends Document {
  name: string;
  board: ObjectId;
  order: number;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const listSchema = new Schema<IList>(
  {
    name: {
      type: String,
      required: [true, 'List name is required'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    board: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: [true, 'Board ID is required'],
    },
    order: {
      type: Number,
      default: 0,
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

// Compound index to quickly fetch and sort lists for a specific board
listSchema.index({ board: 1, order: 1 });

export const List: Model<IList> = mongoose.models.List || mongoose.model<IList>('List', listSchema);
