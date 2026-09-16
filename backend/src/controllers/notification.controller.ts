import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service.js';

class NotificationController {
  async getUserNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const notifications = await notificationService.getUserNotifications(req.user!.id);
      res.status(200).json({
        status: 'success',
        results: notifications.length,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await notificationService.markAsRead(req.params.id as string, req.user!.id);
      res.status(200).json({
        status: 'success',
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead(req.user!.id);
      res.status(200).json({
        status: 'success',
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
