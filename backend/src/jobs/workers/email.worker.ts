import { Worker, Job } from 'bullmq';
import { bullmqRedisClient } from '../../config/redis.js';
import { logger } from '../../utils/logger.js';

export interface EmailJobData {
  to: string;
  subject: string;
  body: string;
}

export const emailWorker = new Worker<EmailJobData>(
  'emailQueue',
  async (job: Job<EmailJobData>) => {
    const { to, subject } = job.data;
    logger.info(`[Email Worker] Processing email to ${to}...`);

    // Simulate SMTP delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    logger.info(`[Email Worker] ✅ Successfully sent email to ${to} (Subject: ${subject})`);
  },
  {
    connection: bullmqRedisClient,
    concurrency: 5,
  }
);

emailWorker.on('completed', (job) => {
  logger.info(`Job ${job.id} has completed!`);
});

emailWorker.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} has failed with ${err.message}`);
});
