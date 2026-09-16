import type { Request, Response } from 'express';
import { z } from 'zod';
import { taskService, CreateTaskDTO, UpdateTaskDTO } from '../services/task.service.js';
import { sendSuccess } from '../utils/httpResponse.js';

// ─── Validation Schemas ───────────────────────────────────────────────────────

const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200),
  description: z.string().max(2000).optional(),
  listId: z.string().min(1, 'List ID is required'),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  listId: z.string().optional(),
  order: z.number().min(0).optional(),
  dueDate: z.string().datetime().optional(), // ISO string
});

const assigneeSchema = z.object({
  assigneeId: z.string().min(1, 'Assignee ID is required'),
});

// ─── Controllers ──────────────────────────────────────────────────────────────

export const create = async (req: Request, res: Response) => {
  const parsed = createTaskSchema.parse(req.body);
  const data: CreateTaskDTO = {
    title: parsed.title,
    listId: parsed.listId,
  };
  if (parsed.description) data.description = parsed.description;

  const userId = req.user!.id;

  const task = await taskService.createTask(data, userId);
  sendSuccess(res, task, 'Task created successfully', 201);
};

export const getByList = async (req: Request, res: Response) => {
  const listId = req.params.listId as string;
  const userId = req.user!.id;

  const tasks = await taskService.getTasksByList(listId, userId);
  sendSuccess(res, tasks, 'Tasks retrieved successfully');
};

export const getOne = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.id;

  const task = await taskService.getTaskById(id, userId);
  sendSuccess(res, task, 'Task retrieved successfully');
};

export const update = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.id;
  const parsed = updateTaskSchema.parse(req.body);

  const data: UpdateTaskDTO = {};
  if (parsed.title !== undefined) data.title = parsed.title;
  if (parsed.description !== undefined) data.description = parsed.description;
  if (parsed.listId !== undefined) data.listId = parsed.listId;
  if (parsed.order !== undefined) data.order = parsed.order;
  if (parsed.dueDate !== undefined) data.dueDate = new Date(parsed.dueDate);

  const task = await taskService.updateTask(id, data, userId);
  sendSuccess(res, task, 'Task updated successfully');
};

export const remove = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.id;

  await taskService.deleteTask(id, userId);
  sendSuccess(res, null, 'Task deleted successfully');
};

export const assign = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.id;
  const { assigneeId } = assigneeSchema.parse(req.body);

  const task = await taskService.assignUser(id, assigneeId, userId);
  sendSuccess(res, task, 'User assigned successfully');
};

export const unassign = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const assigneeId = req.params.assigneeId as string;
  const userId = req.user!.id;

  const task = await taskService.unassignUser(id, assigneeId, userId);
  sendSuccess(res, task, 'User unassigned successfully');
};
