import type { RowDataPacket } from 'mysql2/promise';
import { Notification, type NotificationProps } from '../../domain/entities/Notification.js';
import type { AttemptRecord, NotificationRepository } from '../../domain/ports/NotificationRepository.js';
import type { NotificationStatus } from '../../domain/value-objects/NotificationStatus.js';
import type { DbPool } from '../db/pool.js';

interface NotificationRow extends RowDataPacket {
  id: string;
  client_id: string;
  channel: string;
  recipient: string;
  template_key: string;
  data: string;
  idempotency_key: string | null;
  status: string;
  attempts: number;
  last_error: string | null;
  created_at: Date;
  updated_at: Date;
}

interface AttemptRow extends RowDataPacket {
  attempt_no: number;
  status: string;
  error: string | null;
  provider_message_id: string | null;
  created_at: Date;
}

const parseJson = (v: unknown): Record<string, unknown> => {
  if (v == null) return {};
  if (typeof v === 'object') return v as Record<string, unknown>;
  try {
    return JSON.parse(String(v));
  } catch {
    return {};
  }
};

const toProps = (row: NotificationRow): NotificationProps => ({
  id: row.id,
  clientId: row.client_id,
  channel: row.channel as NotificationProps['channel'],
  recipient: parseJson(row.recipient) as unknown as NotificationProps['recipient'],
  templateKey: row.template_key,
  data: parseJson(row.data),
  idempotencyKey: row.idempotency_key,
  status: row.status as NotificationStatus,
  attempts: row.attempts,
  lastError: row.last_error,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export class MySqlNotificationRepository implements NotificationRepository {
  constructor(private readonly pool: DbPool) {}

  async save(notification: Notification): Promise<void> {
    const p = notification.props;
    await this.pool.execute(
      `INSERT INTO notifications
         (id, client_id, channel, recipient, template_key, data, idempotency_key, status, attempts, last_error)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id,
        p.clientId,
        p.channel,
        JSON.stringify(p.recipient),
        p.templateKey,
        JSON.stringify(p.data),
        p.idempotencyKey,
        p.status,
        p.attempts,
        p.lastError,
      ]
    );
  }

  async findById(id: string): Promise<Notification | null> {
    const [rows] = await this.pool.execute<NotificationRow[]>(
      `SELECT * FROM notifications WHERE id = ? LIMIT 1`,
      [id]
    );
    const row = rows[0];
    return row ? Notification.restore(toProps(row)) : null;
  }

  async findByIdempotencyKey(clientId: string, key: string): Promise<Notification | null> {
    const [rows] = await this.pool.execute<NotificationRow[]>(
      `SELECT * FROM notifications WHERE client_id = ? AND idempotency_key = ? LIMIT 1`,
      [clientId, key]
    );
    const row = rows[0];
    return row ? Notification.restore(toProps(row)) : null;
  }

  async updateStatus(id: string, status: NotificationStatus, lastError: string | null = null): Promise<void> {
    await this.pool.execute(
      `UPDATE notifications
          SET status = ?,
              last_error = ?,
              attempts = attempts + IF(? = 'PROCESSING', 1, 0),
              updated_at = NOW()
        WHERE id = ?`,
      [status, lastError, status, id]
    );
  }

  async recordAttempt(id: string, attempt: AttemptRecord): Promise<void> {
    await this.pool.execute(
      `INSERT INTO notification_attempts (notification_id, attempt_no, status, error, provider_message_id)
       VALUES (?, ?, ?, ?, ?)`,
      [id, attempt.attemptNo, attempt.status, attempt.error, attempt.providerMessageId]
    );
  }

  async listAttempts(id: string): Promise<AttemptRecord[]> {
    const [rows] = await this.pool.execute<AttemptRow[]>(
      `SELECT attempt_no, status, error, provider_message_id, created_at
         FROM notification_attempts WHERE notification_id = ? ORDER BY attempt_no`,
      [id]
    );
    return rows.map((r) => ({
      attemptNo: r.attempt_no,
      status: r.status as AttemptRecord['status'],
      error: r.error,
      providerMessageId: r.provider_message_id,
      createdAt: r.created_at,
    }));
  }
}
