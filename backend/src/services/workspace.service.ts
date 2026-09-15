import { workspaceRepository } from '../repositories/workspace.repository.js';
import { ForbiddenError, NotFoundError } from '../utils/AppError.js';
import { IWorkspace } from '../models/workspace.model.js';
import mongoose from 'mongoose';

export interface CreateWorkspaceDTO {
  name: string;
  description?: string;
}

export interface UpdateWorkspaceDTO {
  name?: string;
  description?: string;
}

class WorkspaceService {
  /**
   * Creates a new workspace and sets the creator as the owner and a member.
   */
  async createWorkspace(data: CreateWorkspaceDTO, ownerId: string): Promise<IWorkspace> {
    const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
    
    const createData: Partial<IWorkspace> = {
      name: data.name,
      owner: ownerObjectId,
      members: [ownerObjectId], // Owner is automatically a member
    };
    if (data.description) createData.description = data.description;

    return workspaceRepository.create(createData);
  }

  /**
   * Retrieves all workspaces the user has access to.
   */
  async getWorkspaces(userId: string): Promise<IWorkspace[]> {
    return workspaceRepository.findUserWorkspaces(userId);
  }

  /**
   * Retrieves a specific workspace, ensuring the user has access.
   */
  async getWorkspaceById(workspaceId: string, userId: string): Promise<IWorkspace> {
    const workspace = await workspaceRepository.findById(workspaceId);

    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    const isOwner = workspace.owner._id.toString() === userId;
    const isMember = workspace.members.some((memberId) => memberId.toString() === userId);

    if (!isOwner && !isMember) {
      throw new ForbiddenError('You do not have access to this workspace');
    }

    return workspace;
  }

  /**
   * Updates a workspace, ensuring the user is the owner.
   */
  async updateWorkspace(workspaceId: string, data: UpdateWorkspaceDTO, userId: string): Promise<IWorkspace> {
    const workspace = await workspaceRepository.findById(workspaceId);

    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    if (workspace.owner._id.toString() !== userId) {
      throw new ForbiddenError('Only the workspace owner can update workspace details');
    }

    const updatedWorkspace = await workspaceRepository.update(workspaceId, data);
    return updatedWorkspace!;
  }

  /**
   * Deletes a workspace, ensuring the user is the owner.
   */
  async deleteWorkspace(workspaceId: string, userId: string): Promise<void> {
    const workspace = await workspaceRepository.findById(workspaceId);

    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    if (workspace.owner._id.toString() !== userId) {
      throw new ForbiddenError('Only the workspace owner can delete the workspace');
    }

    await workspaceRepository.delete(workspaceId);
  }
}

export const workspaceService = new WorkspaceService();
