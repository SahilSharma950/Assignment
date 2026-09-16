import { Request, Response, NextFunction } from 'express';
import { attachmentService } from '../services/attachment.service.js';
import { AppError } from '../utils/AppError.js';

class AttachmentController {
  async uploadAttachment(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.body;
      const file = req.file;

      if (!taskId || !taskId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new AppError('Invalid or missing task ID', 400);
      }

      if (!file) {
        throw new AppError('No file provided', 400);
      }

      const attachment = await attachmentService.createAttachment(
        {
          originalName: file.originalname,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          taskId,
        },
        req.user!.id
      );

      res.status(201).json({
        status: 'success',
        data: attachment,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAttachmentsByTask(req: Request, res: Response, next: NextFunction) {
    try {
      const taskId = req.params.taskId as string;
      if (!taskId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new AppError('Invalid task ID', 400);
      }
      
      const attachments = await attachmentService.getAttachmentsByTask(taskId, req.user!.id);
      res.status(200).json({
        status: 'success',
        results: attachments.length,
        data: attachments,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAttachment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await attachmentService.deleteAttachment(id, req.user!.id);
      res.status(204).json({
        status: 'success',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const attachmentController = new AttachmentController();
