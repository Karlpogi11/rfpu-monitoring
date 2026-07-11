export function parseCsvLine(line: string, delim: string): string[] {
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

  return out.map((s) => s.trim().replace(/^"|"$/g, ''));
}

export function parseCsvDate(raw: string | null | undefined): Date | null {
  if (!raw || raw === '(None)') return null;
  const d = new Date(raw.replace(' ', 'T'));
  return isNaN(d.getTime()) ? null : d;
}

export function fmtDate(v: Date | string | null): string {
  if (!v) return '';
  const d = v instanceof Date ? v : new Date(v);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

export function computeDaysWaiting(closedDateTime: Date | string | null): number | null {
  if (!closedDateTime) return null;
  const d = closedDateTime instanceof Date ? closedDateTime : new Date(closedDateTime);
  if (isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function computeFlag(
  lastRepairClosedDateTime: Date | string | null,
  daysWaiting: number | null
): string {
  if (lastRepairClosedDateTime) {
    const d = lastRepairClosedDateTime instanceof Date ? lastRepairClosedDateTime : new Date(lastRepairClosedDateTime);
    if (!isNaN(d.getTime())) return 'Completed';
  }
  if (daysWaiting !== null && daysWaiting >= 7) return 'Should be Complete';
  return '';
}

export function columnToLetter(column: number): string {
  let letter = '';
  while (column > 0) {
    const remainder = (column - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    column = Math.floor((column - 1) / 26);
  }
  return letter;
}
