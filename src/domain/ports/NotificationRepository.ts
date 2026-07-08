import type { Notification } from '../entities/Notification.js';
import type { NotificationStatus } from '../value-objects/NotificationStatus.js';

export interface AttemptRecord {
  attemptNo: number;
  status: 'SENT' | 'FAILED';
  error: string | null;
  providerMessageId: string | null;
  createdAt: Date;
}

export interface NotificationRepository {
  save(notification: Notification): Promise<void>;
  findById(id: string): Promise<Notification | null>;
  findByIdempotencyKey(clientId: string, key: string): Promise<Notification | null>;
  updateStatus(id: string, status: NotificationStatus, lastError?: string | null): Promise<void>;
  recordAttempt(id: string, attempt: AttemptRecord): Promise<void>;
  listAttempts(id: string): Promise<AttemptRecord[]>;
}
