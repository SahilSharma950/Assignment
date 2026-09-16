import { Board, IBoard } from '../models/board.model.js';
import { ObjectId } from '../types/index.js';

class BoardRepository {
  /**
   * Creates a new board.
   */
  async create(data: Partial<IBoard>): Promise<IBoard> {
    const board = new Board(data);
    return board.save();
  }

  /**
   * Finds a board by ID.
   */
  async findById(id: string | ObjectId): Promise<IBoard | null> {
    return Board.findById(id).populate('createdBy', 'name email avatar');
  }

  /**
   * Finds all boards within a specific workspace.
   */
  async findByWorkspace(workspaceId: string | ObjectId): Promise<IBoard[]> {
    return Board.find({ workspace: workspaceId }).populate('createdBy', 'name email avatar');
  }

  /**
   * Updates a board by ID.
   */
  async update(id: string | ObjectId, data: Partial<IBoard>): Promise<IBoard | null> {
    return Board.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  /**
   * Deletes a board by ID.
   */
  async delete(id: string | ObjectId): Promise<IBoard | null> {
    return Board.findByIdAndDelete(id);
  }
}

export const boardRepository = new BoardRepository();
