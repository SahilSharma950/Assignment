import { TaskModel as Task, ITask } from '../models/task.model.js';
import { ObjectId } from '../types/index.js';

class TaskRepository {
  /**
   * Creates a new task.
   */
  async create(data: Partial<ITask>): Promise<ITask> {
    const task = new Task(data);
    return task.save();
  }

  /**
   * Finds a task by ID.
   */
  async findById(id: string | ObjectId): Promise<ITask | null> {
    return Task.findById(id)
      .populate('createdBy', 'name email avatar')
      .populate('assignees', 'name email avatar');
  }

  /**
   * Finds all tasks within a specific list, sorted by order ascending.
   */
  async findByList(listId: string | ObjectId): Promise<ITask[]> {
    return Task.find({ list: listId })
      .sort({ order: 1 })
      .populate('createdBy', 'name email avatar')
      .populate('assignees', 'name email avatar');
  }

  /**
   * Gets the highest order number for a list's tasks to append a new task at the end.
   */
  async getMaxOrder(listId: string | ObjectId): Promise<number> {
    const highestTask = await Task.findOne({ list: listId }).sort({ order: -1 }).select('order');
    return highestTask ? highestTask.order : -1;
  }

  /**
   * Updates a task by ID.
   */
  async update(id: string | ObjectId, data: Partial<ITask>): Promise<ITask | null> {
    return Task.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  /**
   * Deletes a task by ID.
   */
  async delete(id: string | ObjectId): Promise<ITask | null> {
    return Task.findByIdAndDelete(id);
  }

  /**
   * Adds an assignee to a task.
   */
  async addAssignee(taskId: string | ObjectId, userId: string | ObjectId): Promise<ITask | null> {
    return Task.findByIdAndUpdate(
      taskId,
      { $addToSet: { assignees: userId } },
      { new: true }
    ).populate('assignees', 'name email avatar');
  }

  /**
   * Removes an assignee from a task.
   */
  async removeAssignee(taskId: string | ObjectId, userId: string | ObjectId): Promise<ITask | null> {
    return Task.findByIdAndUpdate(
      taskId,
      { $pull: { assignees: userId } },
      { new: true }
    ).populate('assignees', 'name email avatar');
  }
}

export const taskRepository = new TaskRepository();
