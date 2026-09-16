import { apiClient } from './client';

export interface TaskStatusMetric {
  status: string;
  count: number;
}

export interface WorkspaceOverviewMetric {
  _id: string;
  name: string;
  role: string;
  boardCount: number;
  memberCount: number;
}

export interface UpcomingDeadlineMetric {
  _id: string;
  title: string;
  dueDate: string;
  status: string;
  boardName: string;
}

export interface DashboardMetricsResponse {
  status: string;
  data: {
    taskStatusDistribution: TaskStatusMetric[];
    workspaceOverview: WorkspaceOverviewMetric[];
    upcomingDeadlines: UpcomingDeadlineMetric[];
  };
}

export const analyticsApi = {
  getDashboardMetrics: async (): Promise<DashboardMetricsResponse> => {
    const response = await apiClient.get<DashboardMetricsResponse>('/analytics/dashboard');
    return response.data;
  },
};
