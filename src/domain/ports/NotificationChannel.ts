import type { ChannelType } from '../value-objects/ChannelType.js';
import type { Recipient } from '../value-objects/Recipient.js';

export interface RenderedMessage {
  recipient: Recipient;
  subject: string;
  body: string;
  data: Record<string, string>;
}

export interface DeliveryResult {
  providerMessageId: string | null;
  meta?: Record<string, unknown>;
}

export interface NotificationChannel {
  readonly type: ChannelType;
  send(message: RenderedMessage): Promise<DeliveryResult>;
}
