import { randomUUID } from 'node:crypto';
import { InvalidNotificationError } from '../errors/DomainErrors.js';
import type { ChannelType } from '../value-objects/ChannelType.js';
import type { NotificationStatus } from '../value-objects/NotificationStatus.js';
import type { Recipient, EmailRecipient, FcmRecipient, WhatsAppRecipient } from '../value-objects/Recipient.js';

export interface NotificationProps {
  id: string;
  clientId: string;
  channel: ChannelType;
  recipient: Recipient;
  templateKey: string;
  data: Record<string, unknown>;
  idempotencyKey: string | null;
  status: NotificationStatus;
  attempts: number;
  lastError: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationInput {
  clientId: string;
  channel: ChannelType;
  recipient: Recipient;
  templateKey: string;
  data?: Record<string, unknown>;
  idempotencyKey?: string | null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Notification {
  private constructor(public readonly props: NotificationProps) {}

  static create(input: CreateNotificationInput): Notification {
    if (!input.templateKey?.trim()) {
      throw new InvalidNotificationError('templateKey is required');
    }
    Notification.assertRecipientMatchesChannel(input.channel, input.recipient);
    const now = new Date();
    return new Notification({
      id: randomUUID(),
      clientId: input.clientId,
      channel: input.channel,
      recipient: input.recipient,
      templateKey: input.templateKey.trim(),
      data: input.data ?? {},
      idempotencyKey: input.idempotencyKey ?? null,
      status: 'PENDING',
      attempts: 0,
      lastError: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: NotificationProps): Notification {
    return new Notification(props);
  }

  private static assertRecipientMatchesChannel(channel: ChannelType, recipient: Recipient): void {
    if (channel === 'email') {
      const r = recipient as EmailRecipient;
      if (!r.email || !EMAIL_RE.test(r.email)) {
        throw new InvalidNotificationError('email channel requires a valid recipient.email');
      }
    } else if (channel === 'fcm') {
      const r = recipient as FcmRecipient;
      if (!Array.isArray(r.tokens) || r.tokens.length === 0) {
        throw new InvalidNotificationError('fcm channel requires recipient.tokens (non-empty array)');
      }
    } else if (channel === 'whatsapp') {
      const r = recipient as WhatsAppRecipient;
      if (!r.phone || String(r.phone).replace(/\D/g, '').length < 10) {
        throw new InvalidNotificationError('whatsapp channel requires a valid recipient.phone');
      }
    }
  }

  toJob(): { notificationId: string } {
    return { notificationId: this.props.id };
  }
}
