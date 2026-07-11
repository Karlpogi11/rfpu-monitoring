import { Router } from 'express';
import { eq, and, like, or, SQL } from 'drizzle-orm';
import { getDb } from '../db';
import { records } from '../db/schema';
import { parseCsvDate, computeDaysWaiting, computeFlag, fmtDate } from '../utils/csv';
import { stringify } from 'csv-stringify/sync';

const router = Router();

function buildFilters(siteId: number, query: any) {
  const conditions: SQL[] = [eq(records.siteId, siteId)];

  if (query.status) {
    conditions.push(eq(records.status, query.status));
  }
  if (query.handler) {
    conditions.push(eq(records.handler, query.handler));
  }
  if (query.device) {
    conditions.push(eq(records.device, query.device));
  }
  if (query.search) {
    const p = `%${query.search}%`;
    conditions.push(
      or(
        like(records.orderId, p),
        like(records.serial, p),
        like(records.device, p),
        like(records.lastRepairNumber, p),
      )!
    );
  }

  return (conditions.length === 1 ? conditions[0] : and(...conditions))!;
}

function matchFlag(flag: string, row: { closedDateTime: Date | string | null; lastRepairClosedDateTime: Date | string | null }): boolean {
  const daysWaiting = computeDaysWaiting(row.closedDateTime);
  const computed = computeFlag(row.lastRepairClosedDateTime, daysWaiting);
  if (flag === 'No Flag') return !computed;
  return computed === flag;
}

router.get('/', async (req, res) => {
  try {
    const siteId = parseInt(req.query.site_id as string, 10);
    if (!siteId) {
      return res.status(400).json({ error: 'site_id is required' });
    }

    const db = getDb();
    const where = buildFilters(siteId, req.query);
    const rows = await db
      .select()
      .from(records)
      .where(where)
      .orderBy(records.closedDateTime);

    let enriched = rows.map((row) => {
      const daysWaiting = computeDaysWaiting(row.closedDateTime);
      const flag = computeFlag(row.lastRepairClosedDateTime, daysWaiting);
      return { ...row, days_waiting: daysWaiting, flag };
    });

    if (req.query.flag) {
      enriched = enriched.filter((r) => matchFlag(req.query.flag as string, r));
    }

    res.json(enriched);
  } catch (err) {
    console.error('GET /api/records error:', err);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

router.post('/import', async (req, res) => {
  try {
    const { site_id, rows } = req.body;

    if (!site_id || !Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'site_id and rows[] are required' });
    }

    const db = getDb();
    let inserted = 0;
    let skipped = 0;

    for (const row of rows) {
      const closedDateTime = parseCsvDate(row.closed);
      const lastRepairClosedDateTime = parseCsvDate(row.lastRepairClosed);

      try {
        await db.insert(records).values({
          siteId: site_id,
          orderId: row.orderId || '',
          lastRepairNumber: row.lastRepairNumber || null,
          device: row.device || null,
          serial: row.serial || null,
          closedDateTime: closedDateTime,
          lastRepairClosedDateTime: lastRepairClosedDateTime,
          status: row.status || null,
          handler: row.handler || null,
        });
        inserted++;
      } catch (err: any) {
        if (err?.code === 'ER_DUP_ENTRY') {
          skipped++;
        } else {
          console.error('Import row error:', err);
          skipped++;
        }
      }
    }

    res.json({ inserted, skipped });
  } catch (err) {
    console.error('POST /api/records/import error:', err);
    res.status(500).json({ error: 'Import failed' });
  }
});

router.get('/export', async (req, res) => {
  try {
    const siteId = parseInt(req.query.site_id as string, 10);
    if (!siteId) {
      return res.status(400).json({ error: 'site_id is required' });
    }

    const db = getDb();
    const where = buildFilters(siteId, req.query);
    const rows = await db
      .select()
      .from(records)
      .where(where)
      .orderBy(records.closedDateTime);

    let toExport = rows;
    if (req.query.flag) {
      toExport = rows.filter((r) => matchFlag(req.query.flag as string, r));
    }

    const enriched = toExport.map((row) => {
      const daysWaiting = computeDaysWaiting(row.closedDateTime);
      const flag = computeFlag(row.lastRepairClosedDateTime, daysWaiting);
      return {
        'Order Id': row.orderId,
        'Last Repair Number': row.lastRepairNumber || '',
        'Device': row.device || '',
        'Serial': row.serial || '',
        'Closed Date Time': fmtDate(row.closedDateTime),
        'Last Repair Closed Date Time': fmtDate(row.lastRepairClosedDateTime),
        'Days Waiting': daysWaiting !== null ? daysWaiting : '',
        'Status (as-is)': row.status || '',
        'Handler': row.handler || '',
        'Flag': flag,
      };
    });

    const csv = stringify(enriched, { header: true });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="records_site_${siteId}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error('GET /api/records/export error:', err);
    res.status(500).json({ error: 'Export failed' });
  }
});

export default router;
