import { boardRepository } from '../repositories/board.repository.js';
import { workspaceService } from './workspace.service.js';
import { ForbiddenError, NotFoundError } from '../utils/AppError.js';
import { IBoard } from '../models/board.model.js';
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

    return boardRepository.create(createData);
  }

  /**
   * Retrieves all boards for a workspace after verifying workspace access.
   */
  async getBoardsByWorkspace(workspaceId: string, userId: string): Promise<IBoard[]> {
    // Throws if user is not a member or owner of the workspace
    await workspaceService.getWorkspaceById(workspaceId, userId);

    return boardRepository.findByWorkspace(workspaceId);
  }

  /**
   * Retrieves a specific board after verifying access to its parent workspace.
   */
  async getBoardById(boardId: string, userId: string): Promise<IBoard> {
    const board = await boardRepository.findById(boardId);

    if (!board) {
      throw new NotFoundError('Board not found');
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

    const isBoardCreator = board.createdBy._id.toString() === userId;
    const isWorkspaceOwner = workspace.owner._id.toString() === userId;

    if (!isBoardCreator && !isWorkspaceOwner) {
      throw new ForbiddenError('Only the board creator or workspace owner can update this board');
    }

    const updatedBoard = await boardRepository.update(boardId, data);
    return updatedBoard!;
  }

  /**
   * Deletes a board.
   * Only the user who created the board or the workspace owner can delete it.
   */
  async deleteBoard(boardId: string, userId: string): Promise<void> {
    const board = await boardRepository.findById(boardId);

    if (!board) {
      throw new NotFoundError('Board not found');
    }

    // Get workspace to check if user is the owner of the workspace
    const workspace = await workspaceService.getWorkspaceById(board.workspace.toString(), userId);

    const isBoardCreator = board.createdBy._id.toString() === userId;
    const isWorkspaceOwner = workspace.owner._id.toString() === userId;

    if (!isBoardCreator && !isWorkspaceOwner) {
      throw new ForbiddenError('Only the board creator or workspace owner can delete this board');
    }

    await boardRepository.delete(boardId);
  }
}

export const boardService = new BoardService();
