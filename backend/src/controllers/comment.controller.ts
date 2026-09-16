import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { commentService } from '../services/comment.service.js';
import { AppError } from '../utils/AppError.js';

const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment too long'),
  taskId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid task ID'),
});

const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment too long'),
});

class CommentController {
  async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createCommentSchema.parse(req.body);
      const comment = await commentService.createComment(parsed, req.user!.id);
      res.status(201).json({
        status: 'success',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCommentsByTask(req: Request, res: Response, next: NextFunction) {
    try {
      const taskId = req.params.taskId as string;
      if (!taskId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new AppError('Invalid task ID', 400);
      }
      
      const comments = await commentService.getCommentsByTask(taskId, req.user!.id);
      res.status(200).json({
        status: 'success',
        results: comments.length,
        data: comments,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateComment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const parsed = updateCommentSchema.parse(req.body);
      const comment = await commentService.updateComment(id, parsed, req.user!.id);
      res.status(200).json({
        status: 'success',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await commentService.deleteComment(id, req.user!.id);
      res.status(204).json({
        status: 'success',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const commentController = new CommentController();
