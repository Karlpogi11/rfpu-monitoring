import { useState, useRef } from 'react';
import { importRecords } from '../api';
import { FIELDS } from '../types';
import type { CsvRow } from '../types';
import { btnPrimary, btnSecondary, colors } from '../styles';

interface Props {
  siteId: number;
  onImportComplete: () => void;
}

function parseCsvLine(line: string, delim: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line.charAt(i);
    if (c === '"') {
      if (inQuotes && line.charAt(i + 1) === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === delim && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out.map((s) => s.replace(/^"|"$/g, '').trim());
}

export default function CsvImport({ siteId, onImportComplete }: Props) {
  const [step, setStep] = useState<'drop' | 'map' | 'done'>('drop');
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, number>>({});
  const [extraColumns, setExtraColumns] = useState<{ header: string; colIndex: number; checked: boolean }[]>([]);
  const [status, setStatus] = useState('');
  const [mode, setMode] = useState<'append' | 'replace'>('append');
  const [, setImportResult] = useState<{ inserted: number; skipped: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function guessColumn(patterns: RegExp[], headers: string[]): number {
    for (const p of patterns) {
      for (let i = 0; i < headers.length; i++) {
        if (p.test(headers[i])) return i;
      }
    }
    return -1;
  }

  function handleFile(file: File) {
    setStatus('Reading file...');
    const reader = new FileReader();
    reader.onload = (e) => {
      let text = e.target?.result as string;
      text = text.replace(/^\ufeff/, '');
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        setStatus('File has no data rows.');
        return;
      }
      const first = lines[0];
      const delim = first.includes('\t') ? '\t' : first.includes(';') ? ';' : ',';
      const headers = parseCsvLine(lines[0], delim);
      const rows = lines.slice(1).map((l) => parseCsvLine(l, delim)).filter((c) => c.length > 1);

      setRawHeaders(headers);
      setRawRows(rows);

      const m: Record<string, number> = {};
      const taken = new Set<number>();
      for (const f of FIELDS) {
        const idx = guessColumn(f.patterns, headers);
        if (idx !== -1 && !taken.has(idx)) {
          m[f.key] = idx;
          taken.add(idx);
        } else {
          m[f.key] = -1;
        }
      }
      setMapping(m);

      const used = new Set(Object.values(m));
      const extra = headers.map((h, i) => ({
        header: h,
        colIndex: i,
        checked: false,
      })).filter((_, i) => !used.has(i));
      setExtraColumns(extra);

      setStep('map');
      setStatus('');
    };
    reader.readAsText(file);
  }

  function handleMappingChange(key: string, value: number) {
    setMapping((prev) => ({ ...prev, [key]: value }));
  }

  function handleExtraToggle(index: number) {
    setExtraColumns((prev) =>
      prev.map((c, i) => (i === index ? { ...c, checked: !c.checked } : c))
    );
  }

  async function handleImport() {
    const missing = FIELDS.filter((f) => f.required && mapping[f.key] === -1);
    if (missing.length > 0) {
      setStatus(`Map required fields: ${missing.map((f) => f.label).join(', ')}`);
      return;
    }

    const rows: CsvRow[] = rawRows.map((cols) => {
      const get = (key: string) => (mapping[key] !== -1 ? cols[mapping[key]] || '' : '');
      return {
        orderId: get('orderId'),
        lastRepairNumber: get('lastRepairNumber'),
        closed: get('closed'),
        lastRepairClosed: get('lastRepairClosed'),
        status: get('status'),
        device: get('device'),
        serial: get('serial'),
        handler: get('handler'),
      };
    });

    setStatus('Importing...');
    try {
      const result = await importRecords(siteId, rows, mode);
      setImportResult(result);
      setStep('done');
      setStatus(`Imported ${result.inserted} rows${result.skipped > 0 ? ` (${result.skipped} duplicates skipped)` : ''}.`);
      onImportComplete();
    } catch (err: any) {
      setStatus(err.message || 'Import failed');
    }
  }

  function reset() {
    setStep('drop');
    setRawHeaders([]);
    setRawRows([]);
    setMapping({});
    setExtraColumns([]);
    setStatus('');
    setImportResult(null);
  }

  if (step === 'done') {
    return (
      <div>
        <p style={{ color: '#2f7a4f' }}>{status}</p>
        <button onClick={reset} style={btnSecondary}>Import another file</button>
      </div>
    );
  }

  return (
    <div>
          {step === 'drop' && (
            <>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 14 }}>
                <label style={{ fontSize: 13, color: colors.text, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                  <input type="radio" checked={mode === 'append'} onChange={() => setMode('append')} />
                  Add new (skip duplicates)
                </label>
                <label style={{ fontSize: 13, color: colors.text, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                  <input type="radio" checked={mode === 'replace'} onChange={() => setMode('replace')} />
                  Replace all data
                </label>
              </div>
              <div
                id="dropzone"
                style={{
                  border: `2px dashed ${colors.border}`,
                  borderRadius: 10,
                  padding: '30px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  color: colors.textSecondary,
                }}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#2f6f4f'; }}
                onDragLeave={(e) => { e.currentTarget.style.borderColor = colors.border; }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = colors.border;
                  if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
                }}
              >
                <p><strong>Drag and drop CSV here</strong></p>
                <p>or click to choose a file</p>
                <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => {
                  if (e.target.files?.length) handleFile(e.target.files[0]);
                }} />
              </div>
            </>
          )}

      {step === 'map' && (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: colors.text, margin: '0 0 10px' }}>Core columns</h3>
          {FIELDS.map((f) => (
            <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: `1px solid ${colors.borderLight}` }}>
              <label style={{ width: 200, fontWeight: 500, fontSize: 13, color: colors.text }}>
                {f.label} {f.required && <span style={{ color: '#a3312c' }}>*</span>}
              </label>
              <select
                value={mapping[f.key] ?? -1}
                onChange={(e) => handleMappingChange(f.key, Number(e.target.value))}
              >
                <option value={-1}>-- not in file --</option>
                {rawHeaders.map((h, i) => (
                  <option key={i} value={i}>{h}</option>
                ))}
              </select>
            </div>
          ))}

          <h3>Other columns</h3>
          {extraColumns.length === 0 ? (
            <p style={{ fontSize: 12, color: '#6b6a63' }}>No other columns found.</p>
          ) : (
            extraColumns.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
                <input type="checkbox" checked={c.checked} onChange={() => handleExtraToggle(i)} />
                <label>{c.header}</label>
              </div>
            ))
          )}

          <button onClick={handleImport} style={btnPrimary}>Import</button>
        </div>
      )}

      {status && <p style={{ marginTop: 10, color: status.includes('failed') || status.includes('Map') ? '#a3312c' : '#2f7a4f' }}>{status}</p>}
    </div>
  );
}
