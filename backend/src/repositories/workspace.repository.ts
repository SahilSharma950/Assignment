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

  /**
   * Adds a user to a workspace's member list (no-op if already a member).
   */
  async addMember(id: string | ObjectId, userId: string | ObjectId): Promise<IWorkspace | null> {
    return Workspace.findByIdAndUpdate(
      id,
      { $addToSet: { members: userId } },
      { new: true, runValidators: true },
    ).populate('owner', 'name email avatar');
  }

  /**
   * Removes a user from a workspace's member list.
   */
  async removeMember(id: string | ObjectId, userId: string | ObjectId): Promise<IWorkspace | null> {
    return Workspace.findByIdAndUpdate(
      id,
      { $pull: { members: userId } },
      { new: true, runValidators: true },
    ).populate('owner', 'name email avatar');
  }

  /**
   * Finds a workspace with owner AND members populated with user info.
   * Kept separate from findById because several call sites do
   * `members.some(m => m.toString() === userId)`, which breaks once
   * members are populated documents instead of raw ObjectIds.
   */
  async findByIdWithMembers(id: string | ObjectId): Promise<IWorkspace | null> {
    return Workspace.findById(id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');
  }
}

export const workspaceRepository = new WorkspaceRepository();
