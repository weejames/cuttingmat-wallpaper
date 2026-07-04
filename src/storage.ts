const STORAGE_KEY = "cuttingmat-wallpaper:v1";

export interface PersistedState {
  presetLabel: string;
  customWidth: number;
  customHeight: number;
  pattern: string;
  gradient: string;
  baseColor: string;
  showCalendar: boolean;
  calendarMonth: number;
  calendarYear: number;
  calendarCorner: string;
  showHeadline: boolean;
  showSideLabel: boolean;
  showBlurb: boolean;
  headline: string;
  sideLabel: string;
  blurb: string;
  fontChoice: string;
  googleFontName: string;
  googleFontInput: string;
}

export function loadPersistedState(): Partial<PersistedState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<PersistedState>;
  } catch {
    return null;
  }
}

export function savePersistedState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable (private browsing, quota exceeded, etc.) — silently skip persistence.
  }
}
