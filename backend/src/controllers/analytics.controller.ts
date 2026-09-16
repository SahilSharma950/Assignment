import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service.js';

class AnalyticsController {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await analyticsService.getUserDashboardMetrics(req.user!.id);

      res.status(200).json({
        status: 'success',
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
