import type { Request, Response } from 'express';
import { z } from 'zod';
import { workspaceService, CreateWorkspaceDTO } from '../services/workspace.service.js';
import { sendSuccess } from '../utils/httpResponse.js';

// ─── Validation Schemas ───────────────────────────────────────────────────────

const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').max(100),
  description: z.string().max(500).optional(),
});

const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

// ─── Controllers ──────────────────────────────────────────────────────────────

export const create = async (req: Request, res: Response) => {
  const parsed = createWorkspaceSchema.parse(req.body);
  const data: CreateWorkspaceDTO = { name: parsed.name };
  if (parsed.description) data.description = parsed.description;

  const userId = req.user!.id; // Guaranteed by requireAuth

  const workspace = await workspaceService.createWorkspace(data, userId);
  sendSuccess(res, workspace, 'Workspace created successfully', 201);
};

export const getAll = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const workspaces = await workspaceService.getWorkspaces(userId);
  sendSuccess(res, workspaces, 'Workspaces retrieved successfully');
};

export const getOne = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.id;

  const workspace = await workspaceService.getWorkspaceById(id, userId);
  sendSuccess(res, workspace, 'Workspace retrieved successfully');
};

export const update = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.id;
  const parsed = updateWorkspaceSchema.parse(req.body);
  
  const data: import('../services/workspace.service.js').UpdateWorkspaceDTO = {};
  if (parsed.name) data.name = parsed.name;
  if (parsed.description) data.description = parsed.description;

  const workspace = await workspaceService.updateWorkspace(id, data, userId);
  sendSuccess(res, workspace, 'Workspace updated successfully');
};

export const remove = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.id;

  await workspaceService.deleteWorkspace(id, userId);
  sendSuccess(res, null, 'Workspace deleted successfully');
};
