export interface FontOption {
  label: string;
  family: string;
  stack: string;
  googleFont?: string;
}

export const SYSTEM_FONTS: FontOption[] = [
  { label: "Georgia (serif)", family: "Georgia", stack: 'Georgia, "Times New Roman", serif' },
  { label: "Times New Roman (serif)", family: "Times New Roman", stack: '"Times New Roman", Times, serif' },
  { label: "Helvetica (sans)", family: "Helvetica", stack: "Helvetica, Arial, sans-serif" },
  { label: "Arial (sans)", family: "Arial", stack: "Arial, Helvetica, sans-serif" },
  { label: "Verdana (sans)", family: "Verdana", stack: "Verdana, Geneva, sans-serif" },
  { label: "Futura / Century Gothic (sans)", family: "Century Gothic", stack: '"Century Gothic", Futura, sans-serif' },
  { label: "Courier New (mono)", family: "Courier New", stack: '"Courier New", Courier, monospace' },
  { label: "Palatino (serif)", family: "Palatino", stack: 'Palatino, "Palatino Linotype", serif' },
];

export const CUSTOM_GOOGLE_FONT = "custom-google-font";

const loadedGoogleFonts = new Set<string>();

export function googleFontStack(fontName: string): string {
  return `"${fontName}", sans-serif`;
}

export async function loadGoogleFont(fontName: string): Promise<void> {
  const trimmed = fontName.trim();
  if (!trimmed || loadedGoogleFonts.has(trimmed)) return;

  const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(trimmed).replace(/%20/g, "+")}:wght@400;700&display=swap`;

  await new Promise<void>((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load font "${trimmed}"`));
    document.head.appendChild(link);
  });

  await document.fonts.load(`400 16px "${trimmed}"`);
  await document.fonts.load(`700 16px "${trimmed}"`);
  loadedGoogleFonts.add(trimmed);
}
