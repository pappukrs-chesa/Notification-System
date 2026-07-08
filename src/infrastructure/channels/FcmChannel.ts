import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getMessaging, type Messaging } from 'firebase-admin/messaging';
import type { DeliveryResult, NotificationChannel, RenderedMessage } from '../../domain/ports/NotificationChannel.js';
import type { FcmRecipient } from '../../domain/value-objects/Recipient.js';
import type { Env } from '../../config/env.js';
import { logger } from '../logger.js';

export class FcmChannel implements NotificationChannel {
  readonly type = 'fcm' as const;
  private messaging: Messaging | null = null;

  constructor(private readonly env: Env) {
    if (env.FCM_PROJECT_ID && env.FCM_CLIENT_EMAIL && env.FCM_PRIVATE_KEY) {
      const existing = getApps().find((a: App) => a.name === 'notification-service');
      const app =
        existing ??
        initializeApp(
          {
            credential: cert({
              projectId: env.FCM_PROJECT_ID,
              clientEmail: env.FCM_CLIENT_EMAIL,
              privateKey: env.FCM_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
          },
          'notification-service'
        );
      this.messaging = getMessaging(app);
    }
  }

  async send(message: RenderedMessage): Promise<DeliveryResult> {
    const recipient = message.recipient as FcmRecipient;
    if (this.env.NOTIFY_DRY_RUN) {
      logger.info(
        { channel: 'fcm', tokens: recipient.tokens.length, title: message.subject },
        'DRY RUN — push not sent'
      );
      return { providerMessageId: `dry-run-${Date.now()}`, meta: { tokens: recipient.tokens.length } };
    }
    if (!this.messaging) {
      throw new Error('FCM channel is not configured (FCM_* env missing)');
    }
    const response = await this.messaging.sendEachForMulticast({
      tokens: recipient.tokens,
      notification: { title: message.subject, body: message.body },
      data: message.data,
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    });
    if (response.successCount === 0) {
      const firstError = response.responses.find((r) => r.error)?.error?.message ?? 'all tokens failed';
      throw new Error(`FCM delivery failed for all ${recipient.tokens.length} token(s): ${firstError}`);
    }
    return {
      providerMessageId: response.responses.find((r) => r.success)?.messageId ?? null,
      meta: { successCount: response.successCount, failureCount: response.failureCount },
    };
  }
}
