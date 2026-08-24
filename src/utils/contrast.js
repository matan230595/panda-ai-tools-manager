/**
 * מחשב צבע טקסט אופטימלי (כהה או בהיר) בהתבסס על צבע הרקע.
 * משתמש בנוסחת WCAG 2.1 לחישוב luminance יחסי.
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

  // WCAG 2.1 relative luminance with sRGB gamma correction
  const toLin = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const lum = 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);

  // Contrast ratio against white (#ffffff, L=1) and dark (#0f172a, L≈0.012)
  const contrastWithWhite = (1.0 + 0.05) / (lum + 0.05);
  const contrastWithDark = (lum + 0.05) / (0.012 + 0.05);

  // Pick the text color that gives higher contrast
  return contrastWithWhite >= contrastWithDark ? '#ffffff' : '#0f172a';
}

/**
 * מחזיר מחרוזת סגנון inline עם color מותאם לרקע.
 * @param {string} bgHex
 * @returns {object} { color: string }
 */
export function contrastStyle(bgHex) {
  return { color: getContrastText(bgHex) };
}