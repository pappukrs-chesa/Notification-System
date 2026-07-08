import type { RowDataPacket } from 'mysql2/promise';
import type { NotificationTemplate, TemplateRepository } from '../../domain/ports/TemplateRepository.js';
import type { ChannelType } from '../../domain/value-objects/ChannelType.js';
import type { DbPool } from '../db/pool.js';

interface TemplateRow extends RowDataPacket {
  template_key: string;
  channel: string;
  subject: string;
  body: string;
}

export class MySqlTemplateRepository implements TemplateRepository {
  private cache = new Map<string, { value: NotificationTemplate; expires: number }>();

  constructor(
    private readonly pool: DbPool,
    private readonly ttlMs = 60_000
  ) {}

  async find(templateKey: string, channel: ChannelType): Promise<NotificationTemplate | null> {
    const cacheKey = `${templateKey}:${channel}`;
    const hit = this.cache.get(cacheKey);
    if (hit && hit.expires > Date.now()) return hit.value;

    const [rows] = await this.pool.execute<TemplateRow[]>(
      `SELECT template_key, channel, subject, body
         FROM templates WHERE template_key = ? AND channel = ? AND active = 1 LIMIT 1`,
      [templateKey, channel]
    );
    const row = rows[0];
    if (!row) return null;
    const value: NotificationTemplate = {
      templateKey: row.template_key,
      channel: row.channel as ChannelType,
      subject: row.subject,
      body: row.body,
    };
    this.cache.set(cacheKey, { value, expires: Date.now() + this.ttlMs });
    return value;
  }
}
