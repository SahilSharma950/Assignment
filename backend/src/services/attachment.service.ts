import { attachmentRepository } from '../repositories/attachment.repository.js';
import { taskService } from './task.service.js';
import { NotFoundError, ForbiddenError } from '../utils/AppError.js';
import { IAttachment } from '../models/attachment.model.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export interface CreateAttachmentDTO {
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  taskId: string;
}

class AttachmentService {
  /**
   * Helper method to validate if the user can delete an attachment.
   */
  private async validateAttachmentOwnership(attachment: IAttachment, userId: string): Promise<void> {
    if (attachment.uploadedBy.toString() !== userId) {
      throw new ForbiddenError('You can only delete your own attachments');
    }
  }

  /**
   * Creates a new attachment record after file upload.
   */
  async createAttachment(data: CreateAttachmentDTO, userId: string): Promise<IAttachment> {
    // Validate access to the task (cascades up to List -> Board -> Workspace)
    await taskService.getTaskById(data.taskId, userId);

    const createData: Partial<IAttachment> = {
      originalName: data.originalName,
      filename: data.filename,
      mimetype: data.mimetype,
      size: data.size,
      task: new mongoose.Types.ObjectId(data.taskId),
      uploadedBy: new mongoose.Types.ObjectId(userId),
    };

    return attachmentRepository.create(createData);
  }

  /**
   * Retrieves all attachments for a specific task.
   */
  async getAttachmentsByTask(taskId: string, userId: string): Promise<IAttachment[]> {
    // Validate access to the task
    await taskService.getTaskById(taskId, userId);
    return attachmentRepository.findByTask(taskId);
  }

  /**
   * Deletes an attachment record and the physical file.
   */
  async deleteAttachment(attachmentId: string, userId: string): Promise<void> {
    const attachment = await attachmentRepository.findById(attachmentId);
    if (!attachment) {
      throw new NotFoundError('Attachment not found');
    }

    // Validate access to the task
    await taskService.getTaskById(attachment.task.toString(), userId);

    // Validate ownership
    await this.validateAttachmentOwnership(attachment, userId);

    // Delete record from DB
    await attachmentRepository.delete(attachmentId);

    // Delete physical file
    try {
      const filePath = path.resolve(process.cwd(), env.UPLOAD_DIR, attachment.filename);
      await fs.promises.unlink(filePath);
    } catch (error) {
      // Log error but don't fail the request if file is already missing
      logger.error(`Failed to delete physical file for attachment ${attachmentId}`, { error });
    }
  }
}

export const attachmentService = new AttachmentService();
