interface Hsl {
  h: number;
  s: number;
  l: number;
}

function hexToHsl(hex: string): Hsl {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    default:
      h = (r - g) / d + 4;
  }
  return { h: h * 60, s, l };
}

function hslToString(h: number, s: number, l: number, alpha = 1): string {
  const clampedL = Math.min(1, Math.max(0, l));
  const clampedS = Math.min(1, Math.max(0, s));
  const a = alpha === 1 ? "" : ` / ${alpha}`;
  return `hsl(${h % 360} ${clampedS * 100}% ${clampedL * 100}%${a})`;
}

export interface MatPalette {
  base: string;
  shadowEdge: string;
  highlightSheen: string;
  gridMajor: string;
  gridMinor: string;
  gridDotted: string;
  textPrimary: string;
  textSecondary: string;
}

export function derivePalette(baseHex: string): MatPalette {
  const { h, s, l } = hexToHsl(baseHex);
  const isDark = l < 0.5;

  return {
    base: hslToString(h, s, l),
    shadowEdge: hslToString(h, Math.min(1, s * 1.1), Math.max(0.05, l - 0.22)),
    highlightSheen: hslToString(h, Math.max(0, s - 0.15), Math.min(0.95, l + 0.16), 0.55),
    gridMajor: hslToString(h, Math.max(0, s - 0.6), isDark ? Math.min(1, l + 0.4) : Math.max(0, l - 0.35), 0.85),
    gridMinor: hslToString(h, Math.max(0, s - 0.6), isDark ? Math.min(1, l + 0.4) : Math.max(0, l - 0.35), 0.3),
    gridDotted: hslToString(h, Math.max(0, s - 0.6), isDark ? Math.min(1, l + 0.4) : Math.max(0, l - 0.35), 0.45),
    textPrimary: hslToString(h, Math.max(0, s - 0.7), isDark ? 0.95 : 0.98),
    textSecondary: hslToString(h, Math.max(0, s - 0.7), isDark ? 0.9 : 0.95, 0.85),
  };
}
