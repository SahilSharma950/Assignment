import type { Request, Response } from 'express';
import { z } from 'zod';
import { listService, CreateListDTO, UpdateListDTO } from '../services/list.service.js';
import { sendSuccess } from '../utils/httpResponse.js';

// ─── Validation Schemas ───────────────────────────────────────────────────────

const createListSchema = z.object({
  name: z.string().min(1, 'List name is required').max(100),
  boardId: z.string().min(1, 'Board ID is required'),
});

const updateListSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  order: z.number().min(0).optional(),
});

// ─── Controllers ──────────────────────────────────────────────────────────────

export const create = async (req: Request, res: Response) => {
  const parsed = createListSchema.parse(req.body);
  const data: CreateListDTO = { 
    name: parsed.name,
    boardId: parsed.boardId,
  };

  const userId = req.user!.id; 

  const list = await listService.createList(data, userId);
  sendSuccess(res, list, 'List created successfully', 201);
};

export const getByBoard = async (req: Request, res: Response) => {
  const boardId = req.params.boardId as string;
  const userId = req.user!.id;

  const lists = await listService.getListsByBoard(boardId, userId);
  sendSuccess(res, lists, 'Lists retrieved successfully');
};

export const getOne = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.id;

  const list = await listService.getListById(id, userId);
  sendSuccess(res, list, 'List retrieved successfully');
};

export const update = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.id;
  const parsed = updateListSchema.parse(req.body);
  
  const data: UpdateListDTO = {};
  if (parsed.name !== undefined) data.name = parsed.name;
  if (parsed.order !== undefined) data.order = parsed.order;

  const list = await listService.updateList(id, data, userId);
  sendSuccess(res, list, 'List updated successfully');
};

export const remove = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.id;

  await listService.deleteList(id, userId);
  sendSuccess(res, null, 'List deleted successfully');
};
