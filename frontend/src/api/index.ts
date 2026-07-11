import type { Site, Record, ImportResult, CsvRow, FilterParams } from '../types';

const BASE = import.meta.env.VITE_API_URL || '/api';

export async function fetchSites(): Promise<Site[]> {
  const res = await fetch(`${BASE}/sites`);
  if (!res.ok) throw new Error('Failed to fetch sites');
  return res.json();
}

export async function createSite(name: string): Promise<Site> {
  const res = await fetch(`${BASE}/sites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    try {
      const body = JSON.parse(text);
      throw new Error(body.error || `Server error (${res.status})`);
    } catch {
      throw new Error(`Server error (${res.status}): ${text}`);
    }
  }
  return res.json();
}

export async function renameSite(id: number, name: string): Promise<Site> {
  const res = await fetch(`${BASE}/sites/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to rename site');
  }
  return res.json();
}

export async function deleteSite(id: number): Promise<void> {
  const res = await fetch(`${BASE}/sites/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to delete site');
  }
}

export async function fetchRecords(siteId: number, filters?: FilterParams): Promise<Record[]> {
  const params = new URLSearchParams({ site_id: String(siteId) });
  if (filters?.status) params.set('status', filters.status);
  if (filters?.handler) params.set('handler', filters.handler);
  if (filters?.device) params.set('device', filters.device);
  if (filters?.search) params.set('search', filters.search);
  if (filters?.flag) params.set('flag', filters.flag);
  const res = await fetch(`${BASE}/records?${params}`);
  if (!res.ok) throw new Error('Failed to fetch records');
  return res.json();
}

export async function importRecords(siteId: number, rows: CsvRow[], mode?: 'append' | 'replace'): Promise<ImportResult> {
  const res = await fetch(`${BASE}/records/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ site_id: siteId, rows, mode }),
  });
  if (!res.ok) throw new Error('Import failed');
  return res.json();
}

export function getExportUrl(siteId: number, filters?: FilterParams): string {
  const params = new URLSearchParams({ site_id: String(siteId) });
  if (filters?.status) params.set('status', filters.status);
  if (filters?.handler) params.set('handler', filters.handler);
  if (filters?.device) params.set('device', filters.device);
  if (filters?.search) params.set('search', filters.search);
  if (filters?.flag) params.set('flag', filters.flag);
  return `${BASE}/records/export?${params}`;
}
