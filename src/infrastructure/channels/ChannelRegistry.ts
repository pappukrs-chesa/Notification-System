import type { ChannelResolver } from '../../application/ProcessNotificationUseCase.js';
import { UnknownChannelError } from '../../domain/errors/DomainErrors.js';
import type { NotificationChannel } from '../../domain/ports/NotificationChannel.js';
import type { ChannelType } from '../../domain/value-objects/ChannelType.js';

export class ChannelRegistry implements ChannelResolver {
  private readonly channels = new Map<ChannelType, NotificationChannel>();

  register(channel: NotificationChannel): this {
    this.channels.set(channel.type, channel);
    return this;
  }

  resolve(type: ChannelType): NotificationChannel {
    const channel = this.channels.get(type);
    if (!channel) throw new UnknownChannelError(type);
    return channel;
  }

  registeredTypes(): ChannelType[] {
    return [...this.channels.keys()];
  }
}
