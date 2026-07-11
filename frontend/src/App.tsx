import { useState } from 'react';
import SiteSelector from './components/SiteSelector';
import CsvImport from './components/CsvImport';
import RecordsTable from './components/RecordsTable';
import ExportButton from './components/ExportButton';
import type { FilterParams } from './types';
import { btnPrimary, colors } from './styles';

export default function App() {
  const [siteId, setSiteId] = useState<number | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState<FilterParams>({});

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 20px 48px', background: colors.bg, minHeight: '100vh' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        flexWrap: 'wrap',
        gap: 10,
      }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: colors.text, letterSpacing: '-0.3px' }}>
          RFPU Site Monitor
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <SiteSelector selectedId={siteId} onSelect={setSiteId} />
          <ExportButton siteId={siteId} filters={filters} />
          <button
            onClick={() => setShowImport(!showImport)}
            style={btnPrimary}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {showImport ? 'Close Import' : 'Import CSV'}
          </button>
        </div>
      </div>

      {showImport && siteId && (
        <div style={{
          marginBottom: 24,
          padding: 20,
          border: `1px solid ${colors.borderLight}`,
          borderRadius: 10,
          background: colors.surface,
        }}>
          <CsvImport siteId={siteId} onImportComplete={() => { setRefreshKey((k) => k + 1); setShowImport(false); }} />
        </div>
      )}

      <RecordsTable
        siteId={siteId}
        refreshKey={refreshKey}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
}
