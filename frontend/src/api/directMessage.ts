import { apiClient } from './client';

export interface DirectMessageUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface DirectMessage {
  _id: string;
  sender: DirectMessageUser;
  recipient: DirectMessageUser;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationSummary {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  lastMessage: string;
  lastMessageAt: string;
}

export interface ConversationsResponse {
  success: boolean;
  message: string;
  data: ConversationSummary[];
}

export interface ConversationResponse {
  success: boolean;
  message: string;
  data: DirectMessage[];
}

export const directMessageApi = {
  getConversations: async (): Promise<ConversationsResponse> => {
    const response = await apiClient.get<ConversationsResponse>('/dm/conversations');
    return response.data;
  },

  getConversation: async (userId: string): Promise<ConversationResponse> => {
    const response = await apiClient.get<ConversationResponse>(`/dm/${userId}`);
    return response.data;
  },
};
