import { Worker, type Job } from 'bullmq';
import { buildContainer } from './composition/container.js';
import { NOTIFICATIONS_QUEUE, redisConnection } from './infrastructure/queue/BullMqQueueAdapter.js';
import { logger } from './infrastructure/logger.js';
import type { QueueJob } from './domain/ports/QueuePort.js';

const container = buildContainer();

const worker = new Worker<QueueJob>(
  NOTIFICATIONS_QUEUE,
  async (job: Job<QueueJob>) => {
    const attemptNo = job.attemptsMade + 1;
    logger.info({ notificationId: job.data.notificationId, attemptNo }, 'Processing notification');
    await container.processNotification.execute(job.data.notificationId, attemptNo);
  },
  {
    connection: redisConnection(container.env),
    prefix: 'notify',
    concurrency: 5,
  }
);

worker.on('completed', (job) => {
  logger.info({ notificationId: job.data.notificationId }, 'Notification delivered');
});

worker.on('failed', async (job, err) => {
  if (!job) return;
  const exhausted = job.attemptsMade >= (job.opts.attempts ?? 1);
  logger.warn(
    { notificationId: job.data.notificationId, attempt: job.attemptsMade, exhausted, err: err.message },
    exhausted ? 'Notification moved to DEAD (retries exhausted)' : 'Attempt failed — will retry'
  );
  if (exhausted) {
    try {
      await container.processNotification.markDead(job.data.notificationId, err.message);
    } catch (markErr) {
      logger.error({ err: markErr }, 'Failed to mark notification DEAD');
    }
  }
});

logger.info({ queue: NOTIFICATIONS_QUEUE, concurrency: 5 }, 'notify-worker started');

const shutdown = async (): Promise<void> => {
  logger.info('Shutting down notify-worker');
  await worker.close();
  await container.queue.close();
  await container.pool.end();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
