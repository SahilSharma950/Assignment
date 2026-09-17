import { apiClient } from './client';

export interface SearchUserResult {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface SearchBoardResult {
  _id: string;
  name: string;
  description?: string;
  workspace: string;
  workspaceDoc: { name: string };
}

export interface SearchTaskResult {
  _id: string;
  title: string;
  description?: string;
  status: string;
  boardId: string;
  boardName: string;
  workspaceId: string;
  workspaceName: string;
}

export interface SearchResponse {
  status: string;
  data: {
    users: SearchUserResult[];
    boards: SearchBoardResult[];
    tasks: SearchTaskResult[];
  };
}

export const searchApi = {
  search: async (query: string): Promise<SearchResponse> => {
    const response = await apiClient.get<SearchResponse>('/search', { params: { q: query } });
    return response.data;
  },
};
