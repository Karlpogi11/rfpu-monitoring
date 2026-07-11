import type { CSSProperties } from 'react';

const size = {
  btnY: '7px',
  btnX: '14px',
  ghostY: '6px',
  ghostX: '14px',
  smallY: '5px',
  smallX: '10px',
  inputY: '7px',
  inputX: '10px',
  font: 13,
  radius: 6,
};

export const btnPrimary: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  padding: `${size.btnY} ${size.btnX}`,
  background: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: size.radius,
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: size.font,
  lineHeight: 1.4,
  whiteSpace: 'nowrap',
};

export const btnSecondary: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  padding: `${size.btnY} ${size.btnX}`,
  background: '#fff',
  color: '#374151',
  border: '1px solid #d1d5db',
  borderRadius: size.radius,
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: size.font,
  lineHeight: 1.4,
  whiteSpace: 'nowrap',
  textDecoration: 'none',
};

export const btnGhost: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  padding: `${size.ghostY} ${size.ghostX}`,
  background: 'transparent',
  color: '#2563eb',
  border: '1px solid #2563eb',
  borderRadius: size.radius,
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: size.font,
  lineHeight: 1.4,
  whiteSpace: 'nowrap',
};

export const btnSmall: CSSProperties = {
  ...btnSecondary,
  padding: `${size.smallY} ${size.smallX}`,
  fontSize: 12,
};

export const inputSelect: CSSProperties = {
  padding: `${size.inputY} ${size.inputX}`,
  border: '1px solid #d1d5db',
  borderRadius: size.radius,
  background: '#fff',
  fontSize: size.font,
  color: '#1f2937',
  lineHeight: 1.4,
};
