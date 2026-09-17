import { workspaceRepository } from '../repositories/workspace.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { chatRepository } from '../repositories/chat.repository.js';
import { ForbiddenError, NotFoundError, ConflictError } from '../utils/AppError.js';
import { IWorkspace } from '../models/workspace.model.js';
import { auditLogService } from './auditLog.service.js';
import { cacheService } from './cache.service.js';
import { notificationService } from './notification.service.js';
import { deleteBoardsForWorkspace } from '../utils/cascadeDelete.js';
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

    const workspace = await workspaceRepository.create(createData);
    
    auditLogService.logAction(
      ownerId,
      'WORKSPACE_CREATED',
      workspace.id,
      'Workspace',
      { name: data.name }
    );
    
    return workspace;
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
    const cacheKey = `workspace:${workspaceId}`;
    let workspace = await cacheService.get<IWorkspace>(cacheKey);

    if (!workspace) {
      workspace = await workspaceRepository.findById(workspaceId);
      if (!workspace) {
        throw new NotFoundError('Workspace not found');
      }
      await cacheService.set(cacheKey, workspace, 300); // 5 minutes
    }

    const ownerIdStr = typeof workspace.owner === 'object' && workspace.owner._id 
      ? workspace.owner._id.toString() 
      : workspace.owner.toString();

    const isOwner = ownerIdStr === userId;
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
    
    await cacheService.del(`workspace:${workspaceId}`);

    auditLogService.logAction(
      userId,
      'WORKSPACE_UPDATED',
      workspaceId,
      'Workspace',
      { changes: data }
    );

    return updatedWorkspace!;
  }

  /**
   * Deletes a workspace, along with every board/list/task (and their
   * comments/attachments) and chat message in it. Owner only.
   */
  async deleteWorkspace(workspaceId: string, userId: string): Promise<void> {
    const workspace = await workspaceRepository.findById(workspaceId);

    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    if (workspace.owner._id.toString() !== userId) {
      throw new ForbiddenError('Only the workspace owner can delete the workspace');
    }

    await deleteBoardsForWorkspace(workspaceId);
    await chatRepository.deleteByWorkspace(workspaceId);
    await workspaceRepository.delete(workspaceId);

    await cacheService.del(`workspace:${workspaceId}`);

    auditLogService.logAction(
      userId,
      'WORKSPACE_DELETED',
      workspaceId,
      'Workspace',
      { name: workspace.name }
    );
  }

  /**
   * Adds a user (looked up by email) to a workspace, ensuring the requester is the owner.
   */
  async addMemberByEmail(workspaceId: string, requesterId: string, email: string): Promise<IWorkspace> {
    const workspace = await workspaceRepository.findById(workspaceId);

    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    if (workspace.owner._id.toString() !== requesterId) {
      throw new ForbiddenError('Only the workspace owner can add members');
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError('No user found with that email address');
    }

    const userIdStr = user.id.toString();
    const isAlreadyMember =
      workspace.owner._id.toString() === userIdStr ||
      workspace.members.some((memberId) => memberId.toString() === userIdStr);

    if (isAlreadyMember) {
      throw new ConflictError('This user is already a member of the workspace');
    }

    const updatedWorkspace = await workspaceRepository.addMember(workspaceId, user.id);

    await cacheService.del(`workspace:${workspaceId}`);

    auditLogService.logAction(
      requesterId,
      'WORKSPACE_MEMBER_ADDED',
      workspaceId,
      'Workspace',
      { addedUserId: userIdStr, email }
    );

    await notificationService.pushNotification({
      recipient: user._id,
      sender: new mongoose.Types.ObjectId(requesterId),
      type: 'SYSTEM',
      content: `You've been added to the workspace "${workspace.name}"`,
      entityId: new mongoose.Types.ObjectId(workspaceId),
      entityModel: 'Workspace',
    });

    return updatedWorkspace!;
  }

  /**
   * Removes a member from a workspace, ensuring the requester is the owner.
   * The owner themselves can never be removed this way.
   */
  async removeMember(workspaceId: string, requesterId: string, memberIdToRemove: string): Promise<IWorkspace> {
    const workspace = await workspaceRepository.findById(workspaceId);

    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    if (workspace.owner._id.toString() !== requesterId) {
      throw new ForbiddenError('Only the workspace owner can remove members');
    }

    if (memberIdToRemove === workspace.owner._id.toString()) {
      throw new ForbiddenError('The workspace owner cannot be removed');
    }

    const isMember = workspace.members.some((memberId) => memberId.toString() === memberIdToRemove);
    if (!isMember) {
      throw new NotFoundError('This user is not a member of the workspace');
    }

    const updatedWorkspace = await workspaceRepository.removeMember(workspaceId, memberIdToRemove);

    await cacheService.del(`workspace:${workspaceId}`);

    auditLogService.logAction(
      requesterId,
      'WORKSPACE_MEMBER_REMOVED',
      workspaceId,
      'Workspace',
      { removedUserId: memberIdToRemove }
    );

    return updatedWorkspace!;
  }

  /**
   * Retrieves a workspace's owner + members with user info populated,
   * ensuring the requester has access to the workspace.
   */
  async getWorkspaceMembers(workspaceId: string, userId: string): Promise<IWorkspace> {
    await this.getWorkspaceById(workspaceId, userId);
    const workspace = await workspaceRepository.findByIdWithMembers(workspaceId);
    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }
    return workspace;
  }
}

export const workspaceService = new WorkspaceService();
