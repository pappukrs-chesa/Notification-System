import { Notification, type CreateNotificationInput } from '../domain/entities/Notification.js';
import type { NotificationRepository } from '../domain/ports/NotificationRepository.js';
import type { QueuePort } from '../domain/ports/QueuePort.js';

export interface SendNotificationResult {
  id: string;
  status: string;
  deduplicated: boolean;
}

export class SendNotificationUseCase {
  constructor(
    private readonly repository: NotificationRepository,
    private readonly queue: QueuePort
  ) {}

  async execute(input: CreateNotificationInput): Promise<SendNotificationResult> {
    if (input.idempotencyKey) {
      const existing = await this.repository.findByIdempotencyKey(input.clientId, input.idempotencyKey);
      if (existing) {
        return { id: existing.props.id, status: existing.props.status, deduplicated: true };
      }
    }
    const notification = Notification.create(input);
    await this.repository.save(notification);
    await this.queue.enqueue(notification.toJob());
    return { id: notification.props.id, status: notification.props.status, deduplicated: false };
  }
}
