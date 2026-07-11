import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { fetchSites, createSite, renameSite, deleteSite } from '../api';
import type { Site } from '../types';
import { btnPrimary, btnSecondary, inputSelect, colors } from '../styles';

interface Props {
  selectedId: number | null;
  onSelect: (id: number) => void;
}

type Mode =
  | { type: 'idle' }
  | { type: 'adding' }
  | { type: 'renaming'; site: Site }
  | { type: 'confirmDelete'; site: Site };

export default function SiteSelector({ selectedId, onSelect }: Props) {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>({ type: 'idle' });
  const [editValue, setEditValue] = useState('');
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const selected = sites.find((s) => s.id === selectedId);

  const filtered = useMemo(
    () => sites.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())),
    [sites, search],
  );

  function load() {
    setLoading(true);
    fetchSites()
      .then((data) => {
        setSites(data);
        if (!selectedId && data.length > 0) {
          onSelect(data[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setMode({ type: 'idle' });
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const select = useCallback((id: number) => {
    onSelect(id);
    setOpen(false);
    setMode({ type: 'idle' });
  }, [onSelect]);

  async function handleAdd() {
    const name = editValue.trim();
    if (!name) return;
    try {
      const site = await createSite(name);
      setSites((prev) => [...prev, site].sort((a, b) => a.name.localeCompare(b.name)));
      onSelect(site.id);
      setEditValue('');
      setMode({ type: 'idle' });
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleRename() {
    const name = editValue.trim();
    if (!name || mode.type !== 'renaming') return;
    try {
      const updated = await renameSite(mode.site.id, name);
      setSites((prev) => prev.map((s) => s.id === updated.id ? updated : s).sort((a, b) => a.name.localeCompare(b.name)));
      setEditValue('');
      setMode({ type: 'idle' });
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleDelete() {
    if (mode.type !== 'confirmDelete') return;
    try {
      await deleteSite(mode.site.id);
      const remaining = sites.filter((s) => s.id !== mode.site.id);
      setSites(remaining);
      if (selectedId === mode.site.id && remaining.length > 0) {
        onSelect(remaining[0].id);
      } else if (remaining.length === 0) {
        onSelect(0 as any);
      }
      setMode({ type: 'idle' });
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: 200 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          ...inputSelect,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          cursor: 'pointer',
          textAlign: 'left',
          color: loading ? colors.textSecondary : colors.text,
        }}
      >
        <span>
          {loading ? 'Loading...' : selected ? selected.name : 'Select site'}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform .15s' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 4,
          background: colors.surface,
          border: `1px solid ${colors.borderLight}`,
          borderRadius: 10,
          boxShadow: '0 4px 16px rgba(0,0,0,.08)',
          zIndex: 50,
          minWidth: 260,
        }}>
          {mode.type === 'adding' && (
            <div style={{ padding: 10, borderBottom: `1px solid ${colors.borderLight}` }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder="Site name"
                  style={{ ...inputSelect, flex: 1 }}
                />
                <button onClick={handleAdd} style={btnPrimary}>Add</button>
                <button onClick={() => { setMode({ type: 'idle' }); setEditValue(''); }} style={btnSecondary}>X</button>
              </div>
            </div>
          )}

          {mode.type === 'renaming' && (
            <div style={{ padding: 10, borderBottom: `1px solid ${colors.borderLight}` }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                  placeholder="New name"
                  style={{ ...inputSelect, flex: 1 }}
                />
                <button onClick={handleRename} style={btnPrimary}>Save</button>
                <button onClick={() => { setMode({ type: 'idle' }); setEditValue(''); }} style={btnSecondary}>X</button>
              </div>
            </div>
          )}

          {mode.type === 'confirmDelete' && (
            <div style={{ padding: 10, borderBottom: `1px solid ${colors.borderLight}`, background: '#fef2f2' }}>
              <p style={{ margin: '0 0 8px', fontSize: 13, color: '#991b1b' }}>
                Delete "{mode.site.name}" and all its records?
              </p>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={handleDelete} style={{ ...btnPrimary, background: '#dc2626' }}>Delete</button>
                <button onClick={() => setMode({ type: 'idle' })} style={btnSecondary}>Cancel</button>
              </div>
            </div>
          )}

          {mode.type === 'idle' && (
            <div style={{ padding: '6px 10px', borderBottom: `1px solid ${colors.borderLight}` }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sites..."
                style={{ ...inputSelect, width: '100%', padding: '5px 8px', fontSize: 12 }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {filtered.map((s) => (
              <div
                key={s.id}
                onClick={() => select(s.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  cursor: 'pointer',
                  fontSize: 14,
                  background: s.id === selectedId ? colors.headerBg : undefined,
                  borderBottom: `1px solid ${colors.borderLight}`,
                }}
                onMouseEnter={(e) => { if (s.id !== selectedId) e.currentTarget.style.background = colors.rowHover; }}
                onMouseLeave={(e) => { if (s.id !== selectedId) e.currentTarget.style.background = ''; }}
              >
                <span style={{ fontWeight: s.id === selectedId ? 500 : 400, color: colors.text }}>{s.name}</span>
                <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                  <button
                    title="Rename"
                    onClick={() => { setMode({ type: 'renaming', site: s }); setEditValue(s.name); }}
                    style={iconBtn}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    title="Delete"
                    onClick={() => setMode({ type: 'confirmDelete', site: s })}
                    style={iconBtn}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {mode.type === 'idle' && (
            <div
              onClick={() => { setMode({ type: 'adding' }); setEditValue(''); }}
              style={{
                padding: '9px 12px',
                cursor: 'pointer',
                fontSize: 14,
                color: colors.accent,
                fontWeight: 500,
                borderTop: `1px solid ${colors.borderLight}`,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = colors.rowHover}
              onMouseLeave={(e) => e.currentTarget.style.background = ''}
            >
              + Add Site
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: 4,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
