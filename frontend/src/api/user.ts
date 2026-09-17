import { apiClient } from './client';

export interface UserSummary {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface UserListResponse {
  success: boolean;
  message: string;
  data: UserSummary[];
}

export const userApi = {
  list: async (): Promise<UserListResponse> => {
    const response = await apiClient.get<UserListResponse>('/users');
    return response.data;
  },
};
