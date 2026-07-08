export interface QueueJob {
  notificationId: string;
}

export interface QueuePort {
  enqueue(job: QueueJob): Promise<void>;
}
