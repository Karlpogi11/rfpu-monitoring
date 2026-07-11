import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL || 'mysql://u774697221_rfpu:your_password@srv1986.hstgr.io:3306/u774697221_rfpu',
  waitForConnections: true,
  connectionLimit: 10,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export const db = drizzle(pool, { schema, mode: 'default' });

export function getDb() {
  return db;
}

export async function closeDb() {
  await pool.end();
}
