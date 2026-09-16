import { Worker, Job } from 'bullmq';
import { bullmqRedisClient } from '../../config/redis.js';
import { logger } from '../../utils/logger.js';
import { socketService } from '../../services/socket.service.js';
import { INotification } from '../../models/notification.model.js';

export interface NotificationJobData {
  recipientId: string;
  notification: Partial<INotification>;
}

export const notificationWorker = new Worker<NotificationJobData>(
  'notificationQueue',
  async (job: Job<NotificationJobData>) => {
    const { recipientId, notification } = job.data;
    logger.info(`[Notification Worker] Dispatching push notification to user ${recipientId}`);

    // Emit the event to the user's private socket room
    socketService.emitToUser(recipientId, 'notification', notification);
    
    logger.info(`[Notification Worker] ✅ Dispatched push notification successfully.`);
  },
  {
    connection: bullmqRedisClient,
    concurrency: 10,
  }
);

notificationWorker.on('failed', (job, err) => {
  logger.error(`Notification Job ${job?.id} failed: ${err.message}`);
});
