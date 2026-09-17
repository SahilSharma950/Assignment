import { apiClient } from './client';

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Board {
  _id: string;
  name: string;
  description?: string;
  workspace: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedBoardsResponse {
  status: string;
  data: {
    data: Board[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      hasMore: boolean;
    };
  };
}

export interface CreateBoardPayload {
  name: string;
  description?: string;
  workspaceId: string;
}

export interface BoardResponse {
  success: boolean;
  message: string;
  data: Board;
}

export const boardApi = {
  getWorkspaceBoards: async (workspaceId: string, page: number = 1, limit: number = 10): Promise<PaginatedBoardsResponse> => {
    const response = await apiClient.get<PaginatedBoardsResponse>(`/boards/workspace/${workspaceId}`, {
      params: { page, limit },
    });
    return response.data;
  },

  create: async (data: CreateBoardPayload): Promise<BoardResponse> => {
    const response = await apiClient.post<BoardResponse>('/boards', data);
    return response.data;
  },

  delete: async (boardId: string): Promise<void> => {
    await apiClient.delete(`/boards/${boardId}`);
  },
};
