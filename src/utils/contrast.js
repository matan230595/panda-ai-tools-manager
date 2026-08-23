/**
 * מחשב צבע טקסט אופטימלי (כהה או בהיר) בהתבסס על צבע הרקע.
 * @param {string} hex - צבע רקע בפורמט hex (#rgb / #rrggbb)
 * @returns {string} '#ffffff' או '#0f172a'
 */
export function getContrastText(hex) {
  if (!hex) return '#ffffff';
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(ch => ch + ch).join('');
  if (c.length !== 6) return '#ffffff';
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  // Relative luminance (WCAG)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? '#0f172a' : '#ffffff';
}

/**
 * מחזיר מחרוזת סגנון inline עם color מותאם לרקע.
 * @param {string} bgHex
 * @returns {object} { color: string }
 */
export function contrastStyle(bgHex) {
  return { color: getContrastText(bgHex) };
}