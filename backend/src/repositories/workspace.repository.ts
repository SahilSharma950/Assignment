import { Workspace, IWorkspace } from '../models/workspace.model.js';
import { ObjectId } from '../types/index.js';

class WorkspaceRepository {
  /**
   * Creates a new workspace.
   */
  async create(data: Partial<IWorkspace>): Promise<IWorkspace> {
    const workspace = new Workspace(data);
    return workspace.save();
  }

  /**
   * Finds a workspace by ID.
   */
  async findById(id: string | ObjectId): Promise<IWorkspace | null> {
    return Workspace.findById(id).populate('owner', 'name email avatar');
  }

  /**
   * Finds all workspaces where the user is the owner or a member.
   */
  async findUserWorkspaces(userId: string | ObjectId): Promise<IWorkspace[]> {
    return Workspace.find({
      $or: [{ owner: userId }, { members: userId }],
    }).populate('owner', 'name email avatar');
  }

  /**
   * Updates a workspace by ID.
   */
  async update(id: string | ObjectId, data: Partial<IWorkspace>): Promise<IWorkspace | null> {
    return Workspace.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  /**
   * Deletes a workspace by ID.
   */
  async delete(id: string | ObjectId): Promise<IWorkspace | null> {
    return Workspace.findByIdAndDelete(id);
  }
}

export const workspaceRepository = new WorkspaceRepository();
