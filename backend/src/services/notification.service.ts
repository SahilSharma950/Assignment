import { notificationRepository } from '../repositories/notification.repository.js';
import { INotification } from '../models/notification.model.js';
import { NotFoundError } from '../utils/AppError.js';
import { socketService } from './socket.service.js';

class NotificationService {
  /**
   * Retrieves notifications for a specific user.
   */
  async getUserNotifications(userId: string): Promise<INotification[]> {
    return notificationRepository.getByUser(userId);
  }

  /**
   * Marks a single notification as read.
   */
  async markAsRead(notificationId: string, userId: string): Promise<INotification> {
    const notification = await notificationRepository.markAsRead(notificationId, userId);
    if (!notification) {
      throw new NotFoundError('Notification not found or access denied');
    }
    return notification;
  }

  /**
   * Marks all notifications as read for a user.
   */
  async markAllAsRead(userId: string): Promise<void> {
    await notificationRepository.markAllAsRead(userId);
  }

  /**
   * Creates a notification and pushes it to the recipient via socket.
   */
  async pushNotification(data: Partial<INotification>): Promise<INotification> {
    const notification = await notificationRepository.create(data);
    // Broadcast immediately to the specific user's private socket room
    socketService.emitToUser(notification.recipient.toString(), 'notification', notification);
    return notification;
  }
}

export const notificationService = new NotificationService();
