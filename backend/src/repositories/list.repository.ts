import { List, IList } from '../models/list.model.js';
import { ObjectId } from '../types/index.js';

class ListRepository {
  /**
   * Creates a new list.
   */
  async create(data: Partial<IList>): Promise<IList> {
    const list = new List(data);
    return list.save();
  }

  /**
   * Finds a list by ID.
   */
  async findById(id: string | ObjectId): Promise<IList | null> {
    return List.findById(id).populate('createdBy', 'name email avatar');
  }

  /**
   * Finds all lists within a specific board, sorted by order ascending.
   */
  async findByBoard(boardId: string | ObjectId): Promise<IList[]> {
    return List.find({ board: boardId }).sort({ order: 1 }).populate('createdBy', 'name email avatar');
  }

  /**
   * Gets the highest order number for a board's lists to append a new list at the end.
   */
  async getMaxOrder(boardId: string | ObjectId): Promise<number> {
    const highestList = await List.findOne({ board: boardId }).sort({ order: -1 }).select('order');
    return highestList ? highestList.order : -1;
  }

  /**
   * Updates a list by ID.
   */
  async update(id: string | ObjectId, data: Partial<IList>): Promise<IList | null> {
    return List.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  /**
   * Deletes a list by ID.
   */
  async delete(id: string | ObjectId): Promise<IList | null> {
    return List.findByIdAndDelete(id);
  }
}

export const listRepository = new ListRepository();
