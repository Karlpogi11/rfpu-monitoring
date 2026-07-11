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

export const colors = {
  bg: '#fbfbfd',
  surface: '#ffffff',
  border: '#d2d2d7',
  borderLight: '#e5e5e7',
  text: '#1d1d1f',
  textSecondary: '#86868b',
  accent: '#0071e3',
  accentHover: '#0077ed',
  headerBg: '#f5f5f7',
  rowHover: '#f5f5f7',
};

export const btnPrimary: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  padding: `${size.btnY} ${size.btnX}`,
  background: colors.accent,
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
  background: colors.surface,
  color: colors.accent,
  border: `1px solid ${colors.border}`,
  borderRadius: size.radius,
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: size.font,
  lineHeight: 1.4,
  whiteSpace: 'nowrap',
  textDecoration: 'none',
};

export const btnGhost: CSSProperties = {
  ...btnSecondary,
  background: 'transparent',
  borderColor: colors.accent,
};

export const btnSmall: CSSProperties = {
  ...btnSecondary,
  padding: `${size.smallY} ${size.smallX}`,
  fontSize: 12,
};

export const inputSelect: CSSProperties = {
  padding: `${size.inputY} ${size.inputX}`,
  border: `1px solid ${colors.border}`,
  borderRadius: size.radius,
  background: colors.surface,
  fontSize: size.font,
  color: colors.text,
  lineHeight: 1.4,
};
