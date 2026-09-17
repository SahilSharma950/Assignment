import { apiClient } from './client';
import type { User } from '../types/board';

export interface Attachment {
  _id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  task: string;
  uploadedBy: User;
  createdAt: string;
}

export interface AttachmentResponse {
  success: boolean;
  message: string;
  data: Attachment;
}

export interface AttachmentListResponse {
  success: boolean;
  message: string;
  data: Attachment[];
}

// Static files are served from the API origin's root (e.g. http://localhost:5000/uploads/...),
// not under /api/v1 like every other endpoint — so this strips that suffix back off.
const UPLOAD_ORIGIN = apiClient.defaults.baseURL?.replace(/\/api\/v1\/?$/, '') || '';

export const getAttachmentUrl = (filename: string): string => `${UPLOAD_ORIGIN}/uploads/${filename}`;

export const attachmentApi = {
  getByTask: async (taskId: string): Promise<AttachmentListResponse> => {
    const response = await apiClient.get<AttachmentListResponse>(`/attachments/task/${taskId}`);
    return response.data;
  },

  upload: async (taskId: string, file: File): Promise<AttachmentResponse> => {
    const formData = new FormData();
    formData.append('taskId', taskId);
    formData.append('file', file);

    const response = await apiClient.post<AttachmentResponse>('/attachments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (attachmentId: string): Promise<void> => {
    await apiClient.delete(`/attachments/${attachmentId}`);
  },
};
