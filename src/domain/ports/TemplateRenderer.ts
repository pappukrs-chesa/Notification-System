import type { ChannelType } from '../value-objects/ChannelType.js';
import type { Recipient } from '../value-objects/Recipient.js';
import type { RenderedMessage } from './NotificationChannel.js';

export interface TemplateRenderer {
  render(
    templateKey: string,
    channel: ChannelType,
    recipient: Recipient,
    data: Record<string, unknown>
  ): Promise<RenderedMessage>;
}
