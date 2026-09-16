import { analyticsRepository } from '../repositories/analytics.repository.js';

export interface DashboardMetrics {
  taskStatusDistribution: any[];
  workspaceOverview: any[];
  upcomingDeadlines: any[];
}

class AnalyticsService {
  /**
   * Aggregates all necessary metrics for the user's main dashboard.
   */
  async getUserDashboardMetrics(userId: string): Promise<DashboardMetrics> {
    const [taskStatusDistribution, workspaceOverview, upcomingDeadlines] = await Promise.all([
      analyticsRepository.getTaskStatusDistribution(userId),
      analyticsRepository.getWorkspaceOverview(userId),
      analyticsRepository.getUpcomingDeadlines(userId),
    ]);

    return {
      taskStatusDistribution,
      workspaceOverview,
      upcomingDeadlines,
    };
  }
}

export const analyticsService = new AnalyticsService();
