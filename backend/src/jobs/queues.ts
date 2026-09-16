import { Queue } from 'bullmq';
import { bullmqRedisClient } from '../config/redis.js';

/**
 * Queue for processing outbound emails.
 */
export const emailQueue = new Queue('emailQueue', {
  connection: bullmqRedisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
  },
});

/**
 * Queue for dispatching push notifications globally.
 */
export const notificationQueue = new Queue('notificationQueue', {
  connection: bullmqRedisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
  },
});
