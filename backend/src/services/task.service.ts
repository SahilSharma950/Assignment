import { taskRepository } from '../repositories/task.repository.js';
import { listService } from './list.service.js';
import { boardService } from './board.service.js';
import { workspaceService } from './workspace.service.js';
import { NotFoundError, ForbiddenError } from '../utils/AppError.js';
import { ITask } from '../models/task.model.js';
import mongoose from 'mongoose';

export interface CreateTaskDTO {
  title: string;
  description?: string;
  listId: string;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  listId?: string; // For moving between lists
  order?: number;
  dueDate?: Date;
}

class TaskService {
  /**
   * Helper method to validate access to a list and return the workspace ID.
   * This cascades the security check: List -> Board -> Workspace
   */
  private async validateListAccessAndGetWorkspace(listId: string, userId: string) {
    const list = await listService.getListById(listId, userId);
    const board = await boardService.getBoardById(list.board.toString(), userId);
    const workspace = await workspaceService.getWorkspaceById(board.workspace.toString(), userId);
    return workspace;
  }

  /**
   * Creates a new task in a list.
   */
  async createTask(data: CreateTaskDTO, userId: string): Promise<ITask> {
    await this.validateListAccessAndGetWorkspace(data.listId, userId);

    const maxOrder = await taskRepository.getMaxOrder(data.listId);

    const createData: Partial<ITask> = {
      title: data.title,
      list: new mongoose.Types.ObjectId(data.listId),
      order: maxOrder + 1,
      createdBy: new mongoose.Types.ObjectId(userId),
    };
    if (data.description) createData.description = data.description;

    return taskRepository.create(createData);
  }

  /**
   * Retrieves all tasks for a specific list.
   */
  async getTasksByList(listId: string, userId: string): Promise<ITask[]> {
    await this.validateListAccessAndGetWorkspace(listId, userId);
    return taskRepository.findByList(listId);
  }

  /**
   * Retrieves a specific task by ID.
   */
  async getTaskById(taskId: string, userId: string): Promise<ITask> {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Validate access to the parent list
    await this.validateListAccessAndGetWorkspace(task.list.toString(), userId);

    return task;
  }

  /**
   * Updates a task.
   * Workspace members can update tasks to facilitate collaboration.
   */
  async updateTask(taskId: string, data: UpdateTaskDTO, userId: string): Promise<ITask> {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Ensure access to current list
    await this.validateListAccessAndGetWorkspace(task.list.toString(), userId);

    // If moving to a new list, ensure access to the target list as well
    if (data.listId && data.listId !== task.list.toString()) {
      await this.validateListAccessAndGetWorkspace(data.listId, userId);
      // Optional: recalculate target list maxOrder if order isn't provided, 
      // but usually the frontend provides the new order.
    }

    const updatedTask = await taskRepository.update(taskId, data);
    return updatedTask!;
  }

  /**
   * Deletes a task.
   */
  async deleteTask(taskId: string, userId: string): Promise<void> {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    await this.validateListAccessAndGetWorkspace(task.list.toString(), userId);

    await taskRepository.delete(taskId);
  }

  /**
   * Assigns a user to a task.
   */
  async assignUser(taskId: string, assigneeId: string, userId: string): Promise<ITask> {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const workspace = await this.validateListAccessAndGetWorkspace(task.list.toString(), userId);

    // Validate that the assignee is actually a member of the workspace
    const isAssigneeMember = workspace.members.some((m) => m.toString() === assigneeId) || workspace.owner.toString() === assigneeId;
    if (!isAssigneeMember) {
      throw new ForbiddenError('Assignee must be a member of the workspace');
    }

    const updatedTask = await taskRepository.addAssignee(taskId, assigneeId);
    return updatedTask!;
  }

  /**
   * Removes an assignee from a task.
   */
  async unassignUser(taskId: string, assigneeId: string, userId: string): Promise<ITask> {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    await this.validateListAccessAndGetWorkspace(task.list.toString(), userId);

    const updatedTask = await taskRepository.removeAssignee(taskId, assigneeId);
    return updatedTask!;
  }
}

export const taskService = new TaskService();
