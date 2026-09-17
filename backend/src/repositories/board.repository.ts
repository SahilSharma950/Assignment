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
   * Finds all boards within a specific workspace with pagination.
   */
  async findByWorkspace(workspaceId: string | ObjectId, limit: number = 10, offset: number = 0): Promise<IBoard[]> {
    return Board.find({ workspace: workspaceId })
      .populate('createdBy', 'name email avatar')
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  /**
   * Counts the total number of boards within a workspace.
   */
  async countByWorkspace(workspaceId: string | ObjectId): Promise<number> {
    return Board.countDocuments({ workspace: workspaceId });
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

  /**
   * Finds the IDs of all boards in the given workspace (for cascade deletes).
   */
  async findIdsByWorkspace(workspaceId: string | ObjectId): Promise<string[]> {
    const boards = await Board.find({ workspace: workspaceId }).select('_id');
    return boards.map((b) => b._id.toString());
  }

  /**
   * Deletes every board in the given workspace.
   */
  async deleteByWorkspace(workspaceId: string | ObjectId): Promise<void> {
    await Board.deleteMany({ workspace: workspaceId });
  }
}

export const boardRepository = new BoardRepository();
