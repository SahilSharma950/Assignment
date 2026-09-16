import mongoose from 'mongoose';
import { User, IUser } from '../models/user.model.js';
import { Board, IBoard } from '../models/board.model.js';
import { TaskModel as Task } from '../models/task.model.js';

class SearchRepository {
  /**
   * Search users globally by name or email.
   */
  async searchUsers(query: string, limit: number = 10): Promise<IUser[]> {
    const regex = new RegExp(query, 'i');
    return User.find({
      $or: [{ name: regex }, { email: regex }],
    })
      .select('name email avatar')
      .limit(limit);
  }

  /**
   * Search boards that the user has access to (via workspace membership).
   */
  async searchBoards(query: string, userId: string, limit: number = 10): Promise<IBoard[]> {
    const regex = new RegExp(query, 'i');
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const pipeline = [
      // 1. Match board name or description
      {
        $match: {
          $or: [{ name: regex }, { description: regex }],
        },
      },
      // 2. Lookup the parent workspace
      {
        $lookup: {
          from: 'workspaces',
          localField: 'workspace',
          foreignField: '_id',
          as: 'workspaceDoc',
        },
      },
      { $unwind: '$workspaceDoc' },
      // 3. Ensure the user is a member or owner of the workspace
      {
        $match: {
          $or: [
            { 'workspaceDoc.owner': userObjectId },
            { 'workspaceDoc.members': userObjectId },
          ],
        },
      },
      // 4. Project the result
      {
        $project: {
          name: 1,
          description: 1,
          workspace: 1,
          'workspaceDoc.name': 1,
        },
      },
      { $limit: limit },
    ];

    return Board.aggregate(pipeline);
  }

  /**
   * Search tasks that the user has access to.
   * Path: Task -> List -> Board -> Workspace -> User
   */
  async searchTasks(query: string, userId: string, limit: number = 10): Promise<any[]> {
    const regex = new RegExp(query, 'i');
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const pipeline = [
      // 1. Match task title or description
      {
        $match: {
          $or: [{ title: regex }, { description: regex }],
        },
      },
      // 2. Lookup parent List
      {
        $lookup: {
          from: 'lists',
          localField: 'list',
          foreignField: '_id',
          as: 'listDoc',
        },
      },
      { $unwind: '$listDoc' },
      // 3. Lookup parent Board
      {
        $lookup: {
          from: 'boards',
          localField: 'listDoc.board',
          foreignField: '_id',
          as: 'boardDoc',
        },
      },
      { $unwind: '$boardDoc' },
      // 4. Lookup parent Workspace
      {
        $lookup: {
          from: 'workspaces',
          localField: 'boardDoc.workspace',
          foreignField: '_id',
          as: 'workspaceDoc',
        },
      },
      { $unwind: '$workspaceDoc' },
      // 5. Ensure the user is a member or owner of the workspace
      {
        $match: {
          $or: [
            { 'workspaceDoc.owner': userObjectId },
            { 'workspaceDoc.members': userObjectId },
          ],
        },
      },
      // 6. Project the result
      {
        $project: {
          title: 1,
          description: 1,
          status: '$listDoc.name',
          boardId: '$boardDoc._id',
          boardName: '$boardDoc.name',
          workspaceId: '$workspaceDoc._id',
          workspaceName: '$workspaceDoc.name',
        },
      },
      { $limit: limit },
    ];

    return Task.aggregate(pipeline);
  }
}

export const searchRepository = new SearchRepository();
