export interface Site {
  id: number;
  name: string;
  createdAt: string;
}

export interface Record {
  id: number;
  siteId: number;
  orderId: string;
  lastRepairNumber: string | null;
  device: string | null;
  serial: string | null;
  closedDateTime: string | null;
  lastRepairClosedDateTime: string | null;
  status: string | null;
  handler: string | null;
  createdAt: string;
  days_waiting: number | null;
  flag: string;
}

export interface FilterParams {
  status?: string;
  handler?: string;
  device?: string;
  search?: string;
  flag?: string;
}

export interface ImportResult {
  inserted: number;
  skipped: number;
}

export interface CsvRow {
  orderId: string;
  lastRepairNumber: string;
  closed: string;
  lastRepairClosed: string;
  status: string;
  device: string;
  serial: string;
  handler: string;
  [key: string]: string;
}

export interface FieldMapping {
  key: string;
  label: string;
  required: boolean;
  patterns: RegExp[];
}

export const FIELDS: FieldMapping[] = [
  { key: 'orderId', label: 'Order Id', required: true, patterns: [/order\s*(id|#|num)/i, /ticket/i, /case\s*#/i, /^rma$/i, /^id$/i, /reference/i] },
  { key: 'closed', label: 'Closed Date Time', required: true, patterns: [/closed/i, /close\s*date/i] },
  { key: 'lastRepairClosed', label: 'Last Repair Closed Date Time', required: true, patterns: [/repair closed/i, /last.*closed/i, /repair.*close/i] },
  { key: 'status', label: 'Status', required: true, patterns: [/status/i] },
  { key: 'lastRepairNumber', label: 'Last Repair Number', required: false, patterns: [/repair\s*(#|num)/i, /repair number/i, /rma\s*(#|num)/i] },
  { key: 'device', label: 'Device', required: false, patterns: [/device/i, /model/i, /product/i, /item/i] },
  { key: 'serial', label: 'Serial', required: false, patterns: [/serial/i, /s\/n/i, /imei/i, /sn$/i] },
  { key: 'handler', label: 'Handler', required: false, patterns: [/handler/i, /technician/i, /tech\b/i, /assigne/i, /engineer/i] },
];
