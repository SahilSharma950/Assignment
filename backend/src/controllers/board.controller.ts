import type { Request, Response } from 'express';
import { z } from 'zod';
import { boardService, CreateBoardDTO, UpdateBoardDTO } from '../services/board.service.js';
import { sendSuccess } from '../utils/httpResponse.js';

// ─── Validation Schemas ───────────────────────────────────────────────────────

const createBoardSchema = z.object({
  name: z.string().min(1, 'Board name is required').max(100),
  description: z.string().max(500).optional(),
  workspaceId: z.string().min(1, 'Workspace ID is required'),
});

const updateBoardSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

// ─── Controllers ──────────────────────────────────────────────────────────────

export const create = async (req: Request, res: Response) => {
  const parsed = createBoardSchema.parse(req.body);
  const data: CreateBoardDTO = { 
    name: parsed.name,
    workspaceId: parsed.workspaceId,
  };
  if (parsed.description) data.description = parsed.description;

  const userId = req.user!.id; 

  const board = await boardService.createBoard(data, userId);
  sendSuccess(res, board, 'Board created successfully', 201);
};

export const getByWorkspace = async (req: Request, res: Response) => {
  const workspaceId = req.params.workspaceId as string;
  const userId = req.user!.id;

  const boards = await boardService.getBoardsByWorkspace(workspaceId, userId);
  sendSuccess(res, boards, 'Boards retrieved successfully');
};

export const getOne = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.id;

  const board = await boardService.getBoardById(id, userId);
  sendSuccess(res, board, 'Board retrieved successfully');
};

export const update = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.id;
  const parsed = updateBoardSchema.parse(req.body);
  
  const data: UpdateBoardDTO = {};
  if (parsed.name) data.name = parsed.name;
  if (parsed.description) data.description = parsed.description;

  const board = await boardService.updateBoard(id, data, userId);
  sendSuccess(res, board, 'Board updated successfully');
};

export const remove = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.id;

  await boardService.deleteBoard(id, userId);
  sendSuccess(res, null, 'Board deleted successfully');
};
