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

export const boardApi = {
  getWorkspaceBoards: async (workspaceId: string, page: number = 1, limit: number = 10): Promise<PaginatedBoardsResponse> => {
    const response = await apiClient.get<PaginatedBoardsResponse>(`/workspaces/${workspaceId}/boards`, {
      params: { page, limit },
    });
    return response.data;
  },
  
  // Future methods: createBoard, updateBoard, deleteBoard, getBoardById
};
