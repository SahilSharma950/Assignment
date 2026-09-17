import fs from 'fs';
import path from 'path';
import { taskRepository } from '../repositories/task.repository.js';
import { commentRepository } from '../repositories/comment.repository.js';
import { attachmentRepository } from '../repositories/attachment.repository.js';
import { listRepository } from '../repositories/list.repository.js';
import { boardRepository } from '../repositories/board.repository.js';
import { cacheService } from '../services/cache.service.js';
import { env } from '../config/env.js';
import { logger } from './logger.js';

/**
 * Deletes every comment and attachment (DB record + physical file) belonging
 * to the given tasks. Shared by every cascade level below the task.
 */
async function deleteCommentsAndAttachmentsForTasks(taskIds: string[]): Promise<void> {
  if (taskIds.length === 0) return;

  await commentRepository.deleteByTasks(taskIds);

  const attachments = await attachmentRepository.findByTasks(taskIds);
  await attachmentRepository.deleteByTasks(taskIds);

  for (const attachment of attachments) {
    try {
      const filePath = path.resolve(process.cwd(), env.UPLOAD_DIR, attachment.filename);
      await fs.promises.unlink(filePath);
    } catch (error) {
      // Physical file may already be gone — don't fail the delete over it.
      logger.error('Failed to delete physical file during cascade delete', { error, filename: attachment.filename });
    }
  }
}

/**
 * Deletes every task in the given lists, plus their comments/attachments.
 * Does NOT delete the lists themselves.
 */
export async function deleteTasksForLists(listIds: string[]): Promise<void> {
  if (listIds.length === 0) return;
  const taskIds = await taskRepository.findIdsByLists(listIds);
  await deleteCommentsAndAttachmentsForTasks(taskIds);
  await taskRepository.deleteByLists(listIds);
}

/**
 * Deletes every list in the given boards (and everything under them).
 * Does NOT delete the boards themselves.
 */
export async function deleteListsForBoards(boardIds: string[]): Promise<void> {
  if (boardIds.length === 0) return;
  const listIds = await listRepository.findIdsByBoards(boardIds);
  await deleteTasksForLists(listIds);
  await listRepository.deleteByBoards(boardIds);
}

/**
 * Deletes every board in the given workspace (and everything under them).
 * Does NOT delete the workspace itself.
 */
export async function deleteBoardsForWorkspace(workspaceId: string): Promise<void> {
  const boardIds = await boardRepository.findIdsByWorkspace(workspaceId);
  await deleteListsForBoards(boardIds);
  await boardRepository.deleteByWorkspace(workspaceId);
  await Promise.all(boardIds.map((id) => cacheService.del(`board:${id}`)));
}
