import { NotificationModel as Notification, INotification } from '../models/notification.model.js';
import { ObjectId } from '../types/index.js';

class NotificationRepository {
  /**
   * Create a new notification.
   */
  async create(data: Partial<INotification>): Promise<INotification> {
    const notification = await Notification.create(data);
    return Notification.findById(notification._id).populate('sender', 'name email avatar').exec() as Promise<INotification>;
  }

  /**
   * Get user's recent notifications, newest first.
   */
  async getByUser(userId: string | ObjectId, limit: number = 50): Promise<INotification[]> {
    return Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'name email avatar');
  }

  /**
   * Mark a specific notification as read.
   */
  async markAsRead(notificationId: string, userId: string): Promise<INotification | null> {
    return Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    );
  }

  /**
   * Mark all unread notifications as read for a user.
   */
  async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
  }

  /**
   * Find a specific notification by ID.
   */
  async findById(notificationId: string): Promise<INotification | null> {
    return Notification.findById(notificationId);
  }
}

export const notificationRepository = new NotificationRepository();
