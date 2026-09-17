import mongoose from 'mongoose';
import { TaskModel as Task } from '../models/task.model.js';
import { Workspace } from '../models/workspace.model.js';

class AnalyticsRepository {
  /**
   * Generates a distribution of tasks across different statuses (lists)
   * for tasks that the user is either assigned to or created.
   */
  async getTaskStatusDistribution(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const pipeline = [
      // 1. Match tasks assigned to or created by the user
      {
        $match: {
          $or: [{ assignees: userObjectId }, { createdBy: userObjectId }],
        },
      },
      // 2. Lookup the parent list to get the status name
      {
        $lookup: {
          from: 'lists',
          localField: 'list',
          foreignField: '_id',
          as: 'listDoc',
        },
      },
      { $unwind: '$listDoc' },
      // 3. Group by list name and count
      {
        $group: {
          _id: '$listDoc.name',
          count: { $sum: 1 },
        },
      },
      // 4. Format the output
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
      { $sort: { count: -1 as const } },
    ];

    return Task.aggregate(pipeline);
  }

  /**
   * Gets an overview of workspaces the user belongs to, including board counts.
   */
  async getWorkspaceOverview(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const pipeline = [
      // 1. Match workspaces where user is owner or member
      {
        $match: {
          $or: [{ owner: userObjectId }, { members: userObjectId }],
        },
      },
      // 2. Lookup boards in each workspace
      {
        $lookup: {
          from: 'boards',
          localField: '_id',
          foreignField: 'workspace',
          as: 'boards',
        },
      },
      // 3. Project useful stats
      {
        $project: {
          _id: 1,
          name: 1,
          role: {
            $cond: [{ $eq: ['$owner', userObjectId] }, 'Owner', 'Member'],
          },
          boardCount: { $size: '$boards' },
          memberCount: { $add: [{ $size: '$members' }, 1] }, // Members + Owner
        },
      },
      { $sort: { boardCount: -1 as const } },
    ];

    return Workspace.aggregate(pipeline);
  }

  /**
   * Fetches all dated tasks assigned to or created by the user, sorted by due
   * date ascending — overdue tasks included (they sort to the top), since the
   * dashboard flags those in red rather than hiding them.
   */
  async getUpcomingDeadlines(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const pipeline = [
      // 1. Match tasks assigned to or created by the user that have a due date set
      {
        $match: {
          $or: [{ assignees: userObjectId }, { createdBy: userObjectId }],
          dueDate: { $exists: true, $ne: null },
        },
      },
      // 2. Sort by due date ascending (most overdue / soonest first)
      { $sort: { dueDate: 1 as const } },
      // 3. Lookup List
      {
        $lookup: {
          from: 'lists',
          localField: 'list',
          foreignField: '_id',
          as: 'listDoc',
        },
      },
      { $unwind: '$listDoc' },
      // 4. Lookup Board
      {
        $lookup: {
          from: 'boards',
          localField: 'listDoc.board',
          foreignField: '_id',
          as: 'boardDoc',
        },
      },
      { $unwind: '$boardDoc' },
      // 5. Project final format
      {
        $project: {
          title: 1,
          dueDate: 1,
          status: '$listDoc.name',
          boardId: '$boardDoc._id',
          boardName: '$boardDoc.name',
          workspaceId: '$boardDoc.workspace',
        },
      },
    ];

    return Task.aggregate(pipeline);
  }
}

export const analyticsRepository = new AnalyticsRepository();
