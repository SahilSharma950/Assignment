import { CommentModel as Comment, IComment } from '../models/comment.model.js';
import { ObjectId } from '../types/index.js';
import mongoose from 'mongoose';

class CommentRepository {
  /**
   * Creates a new comment.
   */
  async create(data: Partial<IComment>, session?: mongoose.ClientSession): Promise<IComment> {
    const options = session ? { session } : {};
    const comments = await Comment.create([data], options);
    return comments[0] as IComment;
  }

  /**
   * Finds a comment by ID.
   */
  async findById(id: string | ObjectId, session?: mongoose.ClientSession): Promise<IComment | null> {
    let query = Comment.findById(id);
    if (session) query = query.session(session);
    return query.populate('createdBy', 'name email avatar');
  }

  /**
   * Finds all comments for a specific task, sorted by creation date descending (newest first).
   */
  async findByTask(taskId: string | ObjectId, session?: mongoose.ClientSession): Promise<IComment[]> {
    let query = Comment.find({ task: taskId }).sort({ createdAt: -1 });
    if (session) query = query.session(session);
    return query.populate('createdBy', 'name email avatar');
  }

  /**
   * Updates a comment by ID.
   */
  async update(id: string | ObjectId, data: Partial<IComment>, session?: mongoose.ClientSession): Promise<IComment | null> {
    const options: any = { new: true, runValidators: true };
    if (session) options.session = session;
    const comment = await Comment.findByIdAndUpdate(id, data, options).populate('createdBy', 'name email avatar');
    return comment as IComment | null;
  }

  /**
   * Deletes a comment by ID.
   */
  async delete(id: string | ObjectId, session?: mongoose.ClientSession): Promise<IComment | null> {
    const options: any = {};
    if (session) options.session = session;
    const comment = await Comment.findByIdAndDelete(id, options);
    return comment as IComment | null;
  }
}

export const commentRepository = new CommentRepository();
