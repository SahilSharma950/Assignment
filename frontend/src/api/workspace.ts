import { apiClient } from './client';
import type { UserSummary } from './user';

export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  members: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceResponse {
  success: boolean;
  message: string;
  data: Workspace;
}

export interface WorkspaceWithMembers extends Omit<Workspace, 'owner' | 'members'> {
  owner: UserSummary;
  members: UserSummary[];
}

export interface WorkspaceMembersResponse {
  success: boolean;
  message: string;
  data: WorkspaceWithMembers;
}

export interface WorkspaceListResponse {
  success: boolean;
  message: string;
  data: Workspace[];
}

export interface CreateWorkspacePayload {
  name: string;
  description?: string;
}

export const workspaceApi = {
  getAll: async (): Promise<WorkspaceListResponse> => {
    const response = await apiClient.get<WorkspaceListResponse>('/workspaces');
    return response.data;
  },

  create: async (data: CreateWorkspacePayload): Promise<WorkspaceResponse> => {
    const response = await apiClient.post<WorkspaceResponse>('/workspaces', data);
    return response.data;
  },

  addMember: async (workspaceId: string, email: string): Promise<WorkspaceResponse> => {
    const response = await apiClient.post<WorkspaceResponse>(`/workspaces/${workspaceId}/members`, { email });
    return response.data;
  },

  getMembers: async (workspaceId: string): Promise<WorkspaceMembersResponse> => {
    const response = await apiClient.get<WorkspaceMembersResponse>(`/workspaces/${workspaceId}/members`);
    return response.data;
  },

  removeMember: async (workspaceId: string, userId: string): Promise<WorkspaceResponse> => {
    const response = await apiClient.delete<WorkspaceResponse>(`/workspaces/${workspaceId}/members/${userId}`);
    return response.data;
  },

  delete: async (workspaceId: string): Promise<void> => {
    await apiClient.delete(`/workspaces/${workspaceId}`);
  },
};
