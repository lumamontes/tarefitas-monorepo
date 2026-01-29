/**
 * Interpolate between two hex colors (0 ≤ t ≤ 1).
 * Returns hex string.
 */
function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace(/^#/, '').match(/.{2}/g);
  if (!m) return [0, 0, 0];
  return [parseInt(m[0], 16), parseInt(m[1], 16), parseInt(m[2], 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('');
}

export function interpolateHex(hexA: string, hexB: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(hexA);
  const [r2, g2, b2] = hexToRgb(hexB);
  const r = r1 + (r2 - r1) * t;
  const g = g1 + (g2 - g1) * t;
  const b = b1 + (b2 - b1) * t;
  return rgbToHex(r, g, b);
}

export interface Palette {
  bg: string;
  panel: string;
  sidebar: string;
  text: string;
  mutedText: string;
  accent: string;
  border: string;
}

/**
 * Interpolate between two palettes (0 ≤ t ≤ 1).
 */
export function interpolatePalette(paletteA: Palette, paletteB: Palette, t: number): Palette {
  return {
    bg: interpolateHex(paletteA.bg, paletteB.bg, t),
    panel: interpolateHex(paletteA.panel, paletteB.panel, t),
    sidebar: interpolateHex(paletteA.sidebar, paletteB.sidebar, t),
    text: interpolateHex(paletteA.text, paletteB.text, t),
    mutedText: interpolateHex(paletteA.mutedText, paletteB.mutedText, t),
    accent: interpolateHex(paletteA.accent, paletteB.accent, t),
    border: interpolateHex(paletteA.border, paletteB.border, t),
  };
}
