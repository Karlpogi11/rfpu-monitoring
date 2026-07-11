import { getExportUrl } from '../api';
import type { FilterParams } from '../types';
import { btnSecondary } from '../styles';

interface Props {
  siteId: number | null;
  filters?: FilterParams;
}

export default function ExportButton({ siteId, filters }: Props) {
  if (!siteId) return null;

  return (
    <a
      href={getExportUrl(siteId, filters)}
      download
      style={btnSecondary}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Export CSV
    </a>
  );
}
