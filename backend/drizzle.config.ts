import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'mysql2',
  dbCredentials: {
    uri: process.env.DATABASE_URL || 'mysql://u774697221_rfpu:your_password@srv1986.hstgr.io:3306/u774697221_rfpu',
  },
} satisfies Config;
