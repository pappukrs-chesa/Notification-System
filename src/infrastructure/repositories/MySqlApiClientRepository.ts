import { createHash } from 'node:crypto';
import type { RowDataPacket } from 'mysql2/promise';
import type { DbPool } from '../db/pool.js';

export interface ApiClient {
  id: string;
  name: string;
}

interface ClientRow extends RowDataPacket {
  id: number;
  name: string;
}

export class MySqlApiClientRepository {
  private cache = new Map<string, { value: ApiClient | null; expires: number }>();

  constructor(
    private readonly pool: DbPool,
    private readonly ttlMs = 60_000
  ) {}

  async findByApiKey(apiKey: string): Promise<ApiClient | null> {
    const hash = createHash('sha256').update(apiKey).digest('hex');
    const hit = this.cache.get(hash);
    if (hit && hit.expires > Date.now()) return hit.value;

    const [rows] = await this.pool.execute<ClientRow[]>(
      `SELECT id, name FROM api_clients WHERE api_key_hash = ? AND active = 1 LIMIT 1`,
      [hash]
    );
    const row = rows[0];
    const value = row ? { id: String(row.id), name: row.name } : null;
    this.cache.set(hash, { value, expires: Date.now() + this.ttlMs });
    return value;
  }
}
