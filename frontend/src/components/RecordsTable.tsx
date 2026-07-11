import { useEffect, useState, useMemo } from 'react';
import { fetchRecords } from '../api';
import type { Record, FilterParams } from '../types';
import { btnSmall, inputSelect } from '../styles';

interface Props {
  siteId: number | null;
  refreshKey: number;
  filters: FilterParams;
  onFiltersChange: (filters: FilterParams) => void;
}

const FLAG_OPTIONS = ['Completed', 'Should be Complete', 'No Flag'];

export default function RecordsTable({ siteId, refreshKey, filters, onFiltersChange }: Props) {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(filters.search ?? '');

  useEffect(() => {
    if (!siteId) return;
    setLoading(true);
    fetchRecords(siteId, filters)
      .then((data) => {
        data.sort((a, b) => (b.days_waiting ?? -1) - (a.days_waiting ?? -1));
        setRecords(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [siteId, refreshKey, filters]);

  const distinct = useMemo(() => {
    const statuses = new Set<string>();
    const handlers = new Set<string>();
    for (const r of records) {
      if (r.status) statuses.add(r.status);
      if (r.handler) handlers.add(r.handler);
    }
    return {
      statuses: [...statuses].sort(),
      handlers: [...handlers].sort(),
    };
  }, [records]);

  if (!siteId) return <p style={empty}>Select a site to view records.</p>;

  return (
    <div>
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 12,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <input
          placeholder="Search order, serial, device..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onFiltersChange({ ...filters, search: search || undefined });
          }}
          style={{ ...inputSelect, flex: '1 1 180px', minWidth: 140 }}
        />
        <select
          value={filters.status ?? ''}
          onChange={(e) => onFiltersChange({ ...filters, status: e.target.value || undefined })}
          style={{ ...inputSelect, minWidth: 120 }}
        >
          <option value="">All Statuses</option>
          {distinct.statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filters.handler ?? ''}
          onChange={(e) => onFiltersChange({ ...filters, handler: e.target.value || undefined })}
          style={{ ...inputSelect, minWidth: 120 }}
        >
          <option value="">All Handlers</option>
          {distinct.handlers.map((h) => <option key={h} value={h}>{h}</option>)}
        </select>
        <select
          value={filters.flag ?? ''}
          onChange={(e) => onFiltersChange({ ...filters, flag: e.target.value || undefined })}
          style={{ ...inputSelect, minWidth: 120 }}
        >
          <option value="">All Flags</option>
          {FLAG_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        {(filters.status || filters.handler || filters.search || filters.flag) && (
          <button
            onClick={() => { onFiltersChange({}); setSearch(''); }}
            style={btnSmall}
          >
            Clear filters
          </button>
        )}
      </div>

      {loading && <p style={empty}>Loading...</p>}
      {!loading && records.length === 0 && (
        <p style={empty}>No records match your filters. Import a CSV or adjust filters.</p>
      )}

      {!loading && records.length > 0 && (
        <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid #e8e8ed' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, background: '#fff' }}>
            <thead>
              <tr style={{ background: '#f5f5f7', textAlign: 'left' }}>
                <th style={th}>Order Id</th>
                <th style={th}>Last Repair #</th>
                <th style={th}>Device Description</th>
                <th style={th}>Device Serial</th>
                <th style={th}>Closed Date Time</th>
                <th style={th}>Last Repair Closed Date Time</th>
                <th style={th}>Days Waiting</th>
                <th style={th}>Status</th>
                <th style={th}>Handler</th>
                <th style={th}>Flag</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const bg = r.flag === 'Should be Complete'
                  ? '#fffafa'
                  : r.flag === 'Completed'
                  ? '#f4fcf4'
                  : undefined;

                return (
                  <tr key={r.id} style={{ background: bg, borderBottom: '1px solid #f0f0f0' }}>
                    <td style={td}>{r.orderId}</td>
                    <td style={td}>{r.lastRepairNumber || ''}</td>
                    <td style={td}>{r.device || ''}</td>
                    <td style={td}>{r.serial || ''}</td>
                    <td style={td}>{r.closedDateTime ? formatDate(r.closedDateTime) : ''}</td>
                    <td style={td}>{r.lastRepairClosedDateTime ? formatDate(r.lastRepairClosedDateTime) : ''}</td>
                    <td style={td}>{r.days_waiting !== null ? r.days_waiting : ''}</td>
                    <td style={td}>{r.status || ''}</td>
                    <td style={td}>{r.handler || ''}</td>
                    <td style={{
                      ...td,
                      color: r.flag === 'Should be Complete' ? '#c41e3a' : r.flag === 'Completed' ? '#1e7e34' : '#86868b',
                      fontWeight: r.flag ? 500 : 400,
                    }}>
                      {r.flag || ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{
            padding: '10px 16px',
            background: '#fafafa',
            borderTop: '1px solid #e8e8ed',
            fontSize: 12,
            color: '#86868b',
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
          }}>
            {records.length} record{records.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}

const th: React.CSSProperties = {
  padding: '10px 12px',
  fontWeight: 600,
  whiteSpace: 'nowrap',
  fontSize: 12,
  color: '#6e6e73',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderBottom: '1px solid #e8e8ed',
};

const td: React.CSSProperties = {
  padding: '8px 12px',
  whiteSpace: 'nowrap',
};

const empty: React.CSSProperties = {
  textAlign: 'center',
  padding: '40px 20px',
  color: '#86868b',
  fontSize: 14,
};

function formatDate(d: string): string {
  return d.replace('T', ' ').slice(0, 19);
}
