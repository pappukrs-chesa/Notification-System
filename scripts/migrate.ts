import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { loadEnv } from '../src/config/env.js';

const env = loadEnv();
const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');

const run = async (): Promise<void> => {
  const server = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    multipleStatements: true,
  });
  await server.query(`CREATE DATABASE IF NOT EXISTS \`${env.DB_NAME}\` CHARACTER SET utf8mb4`);
  await server.end();

  const db = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    multipleStatements: true,
  });

  await db.query(
    `CREATE TABLE IF NOT EXISTS _migrations (
       name VARCHAR(255) NOT NULL PRIMARY KEY,
       applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
     ) ENGINE=InnoDB`
  );

  const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    const [applied] = await db.query<mysql.RowDataPacket[]>(`SELECT 1 FROM _migrations WHERE name = ?`, [file]);
    if (applied.length) {
      console.log(`skip   ${file}`);
      continue;
    }
    const sql = readFileSync(join(migrationsDir, file), 'utf8');
    await db.query(sql);
    await db.query(`INSERT INTO _migrations (name) VALUES (?)`, [file]);
    console.log(`applied ${file}`);
  }

  await db.end();
  console.log('Migrations complete.');
};

run().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
