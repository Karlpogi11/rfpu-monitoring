import { mysqlTable, int, varchar, datetime, timestamp, uniqueIndex } from 'drizzle-orm/mysql-core';

export const sites = mysqlTable('sites', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const records = mysqlTable('records', {
  id: int('id').autoincrement().primaryKey(),
  siteId: int('site_id').notNull(),
  orderId: varchar('order_id', { length: 100 }).notNull(),
  lastRepairNumber: varchar('last_repair_number', { length: 100 }),
  device: varchar('device', { length: 255 }),
  serial: varchar('serial', { length: 100 }),
  closedDateTime: datetime('closed_date_time'),
  lastRepairClosedDateTime: datetime('last_repair_closed_date_time'),
  status: varchar('status', { length: 100 }),
  handler: varchar('handler', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  dedupeKey: uniqueIndex('dedupe_key').on(table.siteId, table.orderId, table.lastRepairNumber, table.closedDateTime),
}));
