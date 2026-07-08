import { NotificationNotFoundError, UnknownChannelError } from '../domain/errors/DomainErrors.js';
import type { NotificationRepository } from '../domain/ports/NotificationRepository.js';
import type { TemplateRenderer } from '../domain/ports/TemplateRenderer.js';
import type { NotificationChannel } from '../domain/ports/NotificationChannel.js';
import type { ChannelType } from '../domain/value-objects/ChannelType.js';

export interface ChannelResolver {
  resolve(type: ChannelType): NotificationChannel;
}

export class ProcessNotificationUseCase {
  constructor(
    private readonly repository: NotificationRepository,
    private readonly renderer: TemplateRenderer,
    private readonly channels: ChannelResolver
  ) {}

  async execute(notificationId: string, attemptNo: number): Promise<void> {
    const notification = await this.repository.findById(notificationId);
    if (!notification) throw new NotificationNotFoundError(notificationId);
    if (notification.props.status === 'SENT') return;

    await this.repository.updateStatus(notificationId, 'PROCESSING');
    const { channel, recipient, templateKey, data } = notification.props;

    try {
      const message = await this.renderer.render(templateKey, channel, recipient, data);
      const handler = this.channels.resolve(channel);
      const result = await handler.send(message);
      await this.repository.recordAttempt(notificationId, {
        attemptNo,
        status: 'SENT',
        error: null,
        providerMessageId: result.providerMessageId,
        createdAt: new Date(),
      });
      await this.repository.updateStatus(notificationId, 'SENT', null);
    } catch (err) {
      const messageText = err instanceof Error ? err.message : String(err);
      await this.repository.recordAttempt(notificationId, {
        attemptNo,
        status: 'FAILED',
        error: messageText.slice(0, 950),
        providerMessageId: null,
        createdAt: new Date(),
      });
      await this.repository.updateStatus(notificationId, 'FAILED', messageText.slice(0, 950));
      throw err;
    }
  }

  async markDead(notificationId: string, error: string): Promise<void> {
    await this.repository.updateStatus(notificationId, 'DEAD', error.slice(0, 950));
  }
}
