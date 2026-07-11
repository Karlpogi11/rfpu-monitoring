import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { getDb } from '../db';
import { sites, records } from '../db/schema';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const db = getDb();
    const result = await db.select().from(sites).orderBy(sites.name);
    res.json(result);
  } catch (err) {
    console.error('GET /api/sites error:', err);
    res.status(500).json({ error: 'Failed to fetch sites' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Site name is required' });
    }
    const db = getDb();
    const [site] = await db.insert(sites).values({ name: name.trim() });
    const [created] = await db.select().from(sites).where(eq(sites.id, site.insertId));
    res.status(201).json(created);
  } catch (err: any) {
    if (err?.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Site name already exists' });
    }
    console.error('POST /api/sites error:', err);
    res.status(500).json({ error: 'Failed to create site' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name } = req.body;
    if (!id || !name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Site ID and name are required' });
    }
    const db = getDb();
    await db.update(sites).set({ name: name.trim() }).where(eq(sites.id, id));
    const [updated] = await db.select().from(sites).where(eq(sites.id, id));
    if (!updated) return res.status(404).json({ error: 'Site not found' });
    res.json(updated);
  } catch (err: any) {
    if (err?.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Site name already exists' });
    }
    console.error('PUT /api/sites error:', err);
    res.status(500).json({ error: 'Failed to update site' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'Site ID is required' });

    const db = getDb();
    await db.delete(records).where(eq(records.siteId, id));
    await db.delete(sites).where(eq(sites.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/sites error:', err);
    res.status(500).json({ error: 'Failed to delete site' });
  }
});

export default router;
