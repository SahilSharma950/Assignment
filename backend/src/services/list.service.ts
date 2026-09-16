import { listRepository } from '../repositories/list.repository.js';
import { boardService } from './board.service.js';
import { NotFoundError } from '../utils/AppError.js';
import { IList } from '../models/list.model.js';
import mongoose from 'mongoose';

export interface CreateListDTO {
  name: string;
  boardId: string;
}

export interface UpdateListDTO {
  name?: string;
  order?: number;
}

class ListService {
  /**
   * Creates a new list on a board.
   */
  async createList(data: CreateListDTO, userId: string): Promise<IList> {
    // Verifies user has access to the workspace that contains this board
    await boardService.getBoardById(data.boardId, userId);

    const maxOrder = await listRepository.getMaxOrder(data.boardId);
    
    const createData: Partial<IList> = {
      name: data.name,
      board: new mongoose.Types.ObjectId(data.boardId),
      order: maxOrder + 1, // Append to the end
      createdBy: new mongoose.Types.ObjectId(userId),
    };

    return listRepository.create(createData);
  }

  /**
   * Retrieves all lists for a specific board.
   */
  async getListsByBoard(boardId: string, userId: string): Promise<IList[]> {
    // Validates board/workspace access
    await boardService.getBoardById(boardId, userId);

    return listRepository.findByBoard(boardId);
  }

  /**
   * Retrieves a specific list by ID.
   */
  async getListById(listId: string, userId: string): Promise<IList> {
    const list = await listRepository.findById(listId);
    if (!list) {
      throw new NotFoundError('List not found');
    }

    // Ensure user has access to the board this list belongs to
    await boardService.getBoardById(list.board.toString(), userId);

    return list;
  }

  /**
   * Updates a list.
   * Any workspace member can update the list to facilitate collaboration.
   */
  async updateList(listId: string, data: UpdateListDTO, userId: string): Promise<IList> {
    const list = await listRepository.findById(listId);
    if (!list) {
      throw new NotFoundError('List not found');
    }

    // Validate access to the board
    await boardService.getBoardById(list.board.toString(), userId);

    // In a full production app with strict roles, we could check if user is Workspace Owner 
    // or Board Creator, but for collaborative Trello-style boards, members usually can edit lists.
    
    const updatedList = await listRepository.update(listId, data);
    return updatedList!;
  }

  /**
   * Deletes a list.
   * Any workspace member can delete the list to facilitate collaboration.
   */
  async deleteList(listId: string, userId: string): Promise<void> {
    const list = await listRepository.findById(listId);
    if (!list) {
      throw new NotFoundError('List not found');
    }

    // Validate access to the board
    await boardService.getBoardById(list.board.toString(), userId);

    await listRepository.delete(listId);
  }
}

export const listService = new ListService();
