import mysql from 'mysql2/promise';
import type { Env } from '../../config/env.js';

export type DbPool = mysql.Pool;

export const createPool = (env: Env): DbPool =>
  mysql.createPool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    connectionLimit: 10,
    waitForConnections: true,
  });
