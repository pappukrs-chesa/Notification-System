import { Queue } from 'bullmq';
import type { QueueJob, QueuePort } from '../../domain/ports/QueuePort.js';
import type { Env } from '../../config/env.js';

export const NOTIFICATIONS_QUEUE = 'notifications';

export const redisConnection = (env: Env) => ({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  ...(env.REDIS_PASSWORD ? { password: env.REDIS_PASSWORD } : {}),
});

export class BullMqQueueAdapter implements QueuePort {
  private readonly queue: Queue;

  constructor(env: Env) {
    this.queue = new Queue(NOTIFICATIONS_QUEUE, {
      connection: redisConnection(env),
      prefix: 'notify',
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 30_000 },
        removeOnComplete: { age: 24 * 3600, count: 5000 },
        removeOnFail: false,
      },
    });
  }

  async enqueue(job: QueueJob): Promise<void> {
    await this.queue.add('deliver', job, { jobId: job.notificationId });
  }

  async close(): Promise<void> {
    await this.queue.close();
  }
}
