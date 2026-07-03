export interface Resolution {
  label: string;
  width: number;
  height: number;
}

export interface MatText {
  headline: string;
  sideLabel: string;
  blurb: string;
}

export type MatPattern = "classic" | "plain-grid" | "dot-grid" | "isometric" | "concentric";

export interface PatternOption {
  value: MatPattern;
  label: string;
}

export const PATTERN_OPTIONS: PatternOption[] = [
  { value: "classic", label: "Classic (grid + diagonal)" },
  { value: "plain-grid", label: "Plain square grid" },
  { value: "dot-grid", label: "Dot grid" },
  { value: "isometric", label: "Isometric / triangular grid" },
  { value: "concentric", label: "Concentric circles + grid" },
];

export type MatGradient = "diagonal-sheen" | "plant-shadow" | "soft-blend" | "spotlight" | "aurora-waves";

export interface GradientOption {
  value: MatGradient;
  label: string;
}

export const GRADIENT_OPTIONS: GradientOption[] = [
  { value: "diagonal-sheen", label: "Diagonal Sheen (classic metallic)" },
  { value: "plant-shadow", label: "Plant Shadow (dappled, organic)" },
  { value: "soft-blend", label: "Soft Blend (smooth mesh glow)" },
  { value: "spotlight", label: "Spotlight (off-center glow)" },
  { value: "aurora-waves", label: "Aurora Waves (flowing ribbons)" },
];

export type CalendarCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface CornerOption {
  value: CalendarCorner;
  label: string;
}

export const CORNER_OPTIONS: CornerOption[] = [
  { value: "top-left", label: "Top left" },
  { value: "top-right", label: "Top right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-right", label: "Bottom right" },
];

export interface CalendarConfig {
  enabled: boolean;
  month: number;
  year: number;
  corner: CalendarCorner;
}

export interface MatConfig {
  width: number;
  height: number;
  baseColor: string;
  fontStack: string;
  pattern: MatPattern;
  gradient: MatGradient;
  text: MatText;
  calendar: CalendarConfig;
}

export const DEFAULT_TEXT: MatText = {
  headline: "Stay Focused.",
  sideLabel: "CUTTING MAT — STAY FOCUSED — 2026",
  blurb:
    "Don't let distractions dilute your potential. Instead, direct your attention toward what truly matters, silence the noise that surrounds you, pursue your priorities with intention, and watch clarity transform into extraordinary results.",
};

export const RESOLUTION_PRESETS: Resolution[] = [
  { label: "Desktop — 1920×1080 (Full HD)", width: 1920, height: 1080 },
  { label: "Desktop — 2560×1440 (QHD)", width: 2560, height: 1440 },
  { label: "Desktop — 3840×2160 (4K UHD)", width: 3840, height: 2160 },
  { label: "Desktop — 5120×2880 (5K)", width: 5120, height: 2880 },
  { label: "Ultrawide — 3440×1440", width: 3440, height: 1440 },
  { label: "Ultrawide — 5120×1440", width: 5120, height: 1440 },
  { label: "MacBook — 2880×1800", width: 2880, height: 1800 },
  { label: "iPhone — 1290×2796", width: 1290, height: 2796 },
  { label: "iPhone — 1179×2556", width: 1179, height: 2556 },
  { label: "iPad — 2048×2732", width: 2048, height: 2732 },
  { label: "Android Phone — 1440×3120", width: 1440, height: 3120 },
  { label: "Square — 2000×2000", width: 2000, height: 2000 },
];
