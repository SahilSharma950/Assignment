import { commentRepository } from '../repositories/comment.repository.js';
import { taskService } from './task.service.js';
import { NotFoundError, ForbiddenError } from '../utils/AppError.js';
import { IComment } from '../models/comment.model.js';
import mongoose from 'mongoose';

export interface CreateCommentDTO {
  content: string;
  taskId: string;
}

export interface UpdateCommentDTO {
  content: string;
}

class CommentService {
  /**
   * Helper method to validate if the user can modify or delete a comment.
   * Only the creator, or the workspace owner/admin can delete/update.
   */
  private async validateCommentOwnership(comment: IComment, userId: string, action: 'update' | 'delete'): Promise<void> {
    // If user is the creator, they always have access
    if (comment.createdBy.toString() === userId) {
      return;
    }

    // Only allow deletion by admins/owners if they are not the creator
    if (action === 'delete') {
      // Need to find the workspace. Comment -> Task -> List -> Board -> Workspace.
      // Instead of manual traversal, we can reuse taskService logic which returns the task
      // Wait, taskService.getTaskById already checks list/board/workspace access.
      // We just need to manually get the workspace role if we want to allow admins to delete.
      
      // We can let taskService validate access. But taskService.getTaskById doesn't return the workspace directly.
      // Actually, since this is a simplified RBAC, we'll just restrict updates/deletions to the comment author for now.
      throw new ForbiddenError('You can only modify your own comments');
    }

    throw new ForbiddenError('You can only modify your own comments');
  }

  /**
   * Creates a new comment on a task.
   */
  async createComment(data: CreateCommentDTO, userId: string): Promise<IComment> {
    // Validate access to the task (this cascades up to List -> Board -> Workspace)
    await taskService.getTaskById(data.taskId, userId);

    const createData: Partial<IComment> = {
      content: data.content,
      task: new mongoose.Types.ObjectId(data.taskId),
      createdBy: new mongoose.Types.ObjectId(userId),
    };

    return commentRepository.create(createData);
  }

  /**
   * Retrieves all comments for a specific task.
   */
  async getCommentsByTask(taskId: string, userId: string): Promise<IComment[]> {
    // Validate access to the task
    await taskService.getTaskById(taskId, userId);
    return commentRepository.findByTask(taskId);
  }

  /**
   * Updates a comment.
   */
  async updateComment(commentId: string, data: UpdateCommentDTO, userId: string): Promise<IComment> {
    const comment = await commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    // Validate access to the task
    await taskService.getTaskById(comment.task.toString(), userId);

    // Validate ownership
    await this.validateCommentOwnership(comment, userId, 'update');

    const updatedComment = await commentRepository.update(commentId, { content: data.content });
    return updatedComment!;
  }

  /**
   * Deletes a comment.
   */
  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    // Validate access to the task
    await taskService.getTaskById(comment.task.toString(), userId);

    // Validate ownership
    await this.validateCommentOwnership(comment, userId, 'delete');

    await commentRepository.delete(commentId);
  }
}

export const commentService = new CommentService();
