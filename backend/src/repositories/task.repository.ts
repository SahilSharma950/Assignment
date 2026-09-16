import { TaskModel as Task, ITask } from '../models/task.model.js';
import { ObjectId } from '../types/index.js';
import mongoose from 'mongoose';

class TaskRepository {
  /**
   * Creates a new task.
   */
  async create(data: Partial<ITask>, session?: mongoose.ClientSession): Promise<ITask> {
    const options = session ? { session } : {};
    const tasks = await Task.create([data], options);
    return tasks[0] as ITask;
  }

  /**
   * Finds a task by ID.
   */
  async findById(id: string | ObjectId, session?: mongoose.ClientSession): Promise<ITask | null> {
    let query = Task.findById(id);
    if (session) query = query.session(session);
    return query
      .populate('createdBy', 'name email avatar')
      .populate('assignees', 'name email avatar');
  }

  /**
   * Finds all tasks within a specific list, sorted by order ascending.
   */
  async findByList(listId: string | ObjectId, session?: mongoose.ClientSession): Promise<ITask[]> {
    let query = Task.find({ list: listId }).sort({ order: 1 });
    if (session) query = query.session(session);
    return query
      .populate('createdBy', 'name email avatar')
      .populate('assignees', 'name email avatar');
  }

  /**
   * Gets the highest order number for a list's tasks to append a new task at the end.
   */
  async getMaxOrder(listId: string | ObjectId, session?: mongoose.ClientSession): Promise<number> {
    let query = Task.findOne({ list: listId }).sort({ order: -1 }).select('order');
    if (session) query = query.session(session);
    const highestTask = await query;
    return highestTask ? highestTask.order : -1;
  }

  /**
   * Shifts orders of tasks in a list.
   * Useful when inserting or removing tasks to prevent collisions.
   */
  async shiftOrders(
    listId: string | ObjectId,
    fromOrder: number,
    toOrder: number | null,
    shiftValue: 1 | -1,
    session?: mongoose.ClientSession
  ): Promise<void> {
    const query: any = { list: listId, order: { $gte: fromOrder } };
    if (toOrder !== null) {
      query.order.$lte = toOrder;
    }
    
    const options = session ? { session } : {};
    await Task.updateMany(query, { $inc: { order: shiftValue } }, options);
  }

  /**
   * Updates a task by ID.
   */
  async update(id: string | ObjectId, data: Partial<ITask>, session?: mongoose.ClientSession): Promise<ITask | null> {
    const options: any = { new: true, runValidators: true };
    if (session) options.session = session;
    const task = await Task.findByIdAndUpdate(id, data, options);
    return task as ITask | null;
  }

  /**
   * Deletes a task by ID.
   */
  async delete(id: string | ObjectId, session?: mongoose.ClientSession): Promise<ITask | null> {
    const options: any = {};
    if (session) options.session = session;
    const task = await Task.findByIdAndDelete(id, options);
    return task as ITask | null;
  }

  /**
   * Adds an assignee to a task.
   */
  async addAssignee(taskId: string | ObjectId, userId: string | ObjectId, session?: mongoose.ClientSession): Promise<ITask | null> {
    const options: any = { new: true };
    if (session) options.session = session;
    const task = await Task.findByIdAndUpdate(
      taskId,
      { $addToSet: { assignees: userId } },
      options
    ).populate('assignees', 'name email avatar');
    return task as ITask | null;
  }

  /**
   * Removes an assignee from a task.
   */
  async removeAssignee(taskId: string | ObjectId, userId: string | ObjectId, session?: mongoose.ClientSession): Promise<ITask | null> {
    const options: any = { new: true };
    if (session) options.session = session;
    const task = await Task.findByIdAndUpdate(
      taskId,
      { $pull: { assignees: userId } },
      options
    ).populate('assignees', 'name email avatar');
    return task as ITask | null;
  }
}

export const taskRepository = new TaskRepository();
