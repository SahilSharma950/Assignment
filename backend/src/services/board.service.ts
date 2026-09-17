import { boardRepository } from '../repositories/board.repository.js';
import { listRepository } from '../repositories/list.repository.js';
import { workspaceService } from './workspace.service.js';
import { ForbiddenError, NotFoundError } from '../utils/AppError.js';
import { IBoard } from '../models/board.model.js';
import { cacheService } from './cache.service.js';
import { deleteListsForBoards } from '../utils/cascadeDelete.js';
import mongoose from 'mongoose';

export interface CreateBoardDTO {
  name: string;
  description?: string;
  workspaceId: string;
}

export interface UpdateBoardDTO {
  name?: string;
  description?: string;
}

class BoardService {
  /**
   * Creates a new board after verifying workspace access.
   * Auto-creates default lists (To Do, Doing, Done) to establish task status movement.
   */
  async createBoard(data: CreateBoardDTO, userId: string): Promise<IBoard> {
    // Throws if user is not a member or owner of the workspace
    await workspaceService.getWorkspaceById(data.workspaceId, userId);

    const createData: Partial<IBoard> = {
      name: data.name,
      workspace: new mongoose.Types.ObjectId(data.workspaceId),
      createdBy: new mongoose.Types.ObjectId(userId),
    };
    if (data.description) createData.description = data.description;

    const board = await boardRepository.create(createData);

    // Auto-create default lists for status movement (Task 14)
    const defaultLists = ['To Do', 'Doing', 'Done'];
    let order = 0;
    for (const listName of defaultLists) {
      await listRepository.create({
        name: listName,
        board: board._id as mongoose.Types.ObjectId,
        order: order++,
        createdBy: new mongoose.Types.ObjectId(userId),
      });
    }

    return board;
  }

  /**
   * Retrieves paginated boards for a workspace after verifying workspace access.
   */
  async getBoardsByWorkspace(workspaceId: string, userId: string, page: number = 1, limit: number = 10) {
    // Throws if user is not a member or owner of the workspace
    await workspaceService.getWorkspaceById(workspaceId, userId);

    const offset = (page - 1) * limit;
    
    const [boards, total] = await Promise.all([
      boardRepository.findByWorkspace(workspaceId, limit, offset),
      boardRepository.countByWorkspace(workspaceId),
    ]);
    
    return {
      data: boards,
      pagination: {
        total,
        page,
        limit,
        hasMore: offset + boards.length < total,
      }
    };
  }

  /**
   * Retrieves a specific board after verifying access to its parent workspace.
   */
  async getBoardById(boardId: string, userId: string): Promise<IBoard> {
    const cacheKey = `board:${boardId}`;
    let board = await cacheService.get<IBoard>(cacheKey);

    if (!board) {
      board = await boardRepository.findById(boardId);
      if (!board) {
        throw new NotFoundError('Board not found');
      }
      await cacheService.set(cacheKey, board, 300); // 5 minutes cache
    }

    // Ensure the user has access to the workspace this board belongs to
    await workspaceService.getWorkspaceById(board.workspace.toString(), userId);

    return board;
  }

  /**
   * Updates a board.
   * Only the user who created the board or the workspace owner can update it.
   */
  async updateBoard(boardId: string, data: UpdateBoardDTO, userId: string): Promise<IBoard> {
    const board = await boardRepository.findById(boardId);

    if (!board) {
      throw new NotFoundError('Board not found');
    }

    // Get workspace to check if user is the owner of the workspace
    const workspace = await workspaceService.getWorkspaceById(board.workspace.toString(), userId);

    const creatorIdStr = typeof board.createdBy === 'object' && board.createdBy._id 
      ? board.createdBy._id.toString() 
      : board.createdBy.toString();
    const isBoardCreator = creatorIdStr === userId;
    
    const workspaceOwnerIdStr = typeof workspace.owner === 'object' && workspace.owner._id 
      ? workspace.owner._id.toString() 
      : workspace.owner.toString();
    const isWorkspaceOwner = workspaceOwnerIdStr === userId;

    if (!isBoardCreator && !isWorkspaceOwner) {
      throw new ForbiddenError('Only the board creator or workspace owner can update this board');
    }

    const updatedBoard = await boardRepository.update(boardId, data);
    
    await cacheService.del(`board:${boardId}`);
    
    return updatedBoard!;
  }

  /**
   * Deletes a board, along with every list/task (and their comments/attachments) on it.
   * Only the user who created the board or the workspace owner can delete it.
   */
  async deleteBoard(boardId: string, userId: string): Promise<void> {
    const board = await boardRepository.findById(boardId);

    if (!board) {
      throw new NotFoundError('Board not found');
    }

    // Get workspace to check if user is the owner of the workspace
    const workspace = await workspaceService.getWorkspaceById(board.workspace.toString(), userId);

    const creatorIdStr = typeof board.createdBy === 'object' && board.createdBy._id
      ? board.createdBy._id.toString()
      : board.createdBy.toString();
    const isBoardCreator = creatorIdStr === userId;

    const workspaceOwnerIdStr = typeof workspace.owner === 'object' && workspace.owner._id
      ? workspace.owner._id.toString()
      : workspace.owner.toString();
    const isWorkspaceOwner = workspaceOwnerIdStr === userId;

    if (!isBoardCreator && !isWorkspaceOwner) {
      throw new ForbiddenError('Only the board creator or workspace owner can delete this board');
    }

    await deleteListsForBoards([boardId]);
    await boardRepository.delete(boardId);
    await cacheService.del(`board:${boardId}`);
  }
}

export const boardService = new BoardService();
