import { useMemo, useState } from "react";
import { MatPreview } from "./MatPreview";
import { exportMatAsPng } from "./export";
import { CUSTOM_GOOGLE_FONT, googleFontStack, loadGoogleFont, SYSTEM_FONTS } from "./fonts";
import { COLOR_PRESETS, CORNER_OPTIONS, DEFAULT_TEXT, GRADIENT_OPTIONS, PATTERN_OPTIONS, RESOLUTION_PRESETS } from "./types";
import type { CalendarCorner, MatConfig, MatGradient, MatPattern } from "./types";

const CUSTOM_PRESET = "custom";
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function App() {
  const now = useMemo(() => new Date(), []);
  const [presetLabel, setPresetLabel] = useState(RESOLUTION_PRESETS[0].label);
  const [customWidth, setCustomWidth] = useState(1920);
  const [customHeight, setCustomHeight] = useState(1080);
  const [pattern, setPattern] = useState<MatPattern>("classic");
  const [gradient, setGradient] = useState<MatGradient>("diagonal-sheen");
  const [baseColor, setBaseColor] = useState("#0f7a5c");
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth());
  const [calendarYear, setCalendarYear] = useState(now.getFullYear());
  const [calendarCorner, setCalendarCorner] = useState<CalendarCorner>("bottom-left");
  const [showHeadline, setShowHeadline] = useState(true);
  const [showSideLabel, setShowSideLabel] = useState(true);
  const [showBlurb, setShowBlurb] = useState(true);
  const [headline, setHeadline] = useState(DEFAULT_TEXT.headline);
  const [sideLabel, setSideLabel] = useState(DEFAULT_TEXT.sideLabel);
  const [blurb, setBlurb] = useState(DEFAULT_TEXT.blurb);

  const [fontChoice, setFontChoice] = useState("Helvetica");
  const [googleFontName, setGoogleFontName] = useState("");
  const [googleFontInput, setGoogleFontInput] = useState("");
  const [googleFontStatus, setGoogleFontStatus] = useState<"idle" | "loading" | "error">("idle");

  const isCustom = presetLabel === CUSTOM_PRESET;
  const preset = RESOLUTION_PRESETS.find((p) => p.label === presetLabel);
  const width = isCustom ? customWidth : (preset?.width ?? 1920);
  const height = isCustom ? customHeight : (preset?.height ?? 1080);

  const isGoogleFont = fontChoice === CUSTOM_GOOGLE_FONT;
  const fontStack = isGoogleFont
    ? (googleFontName ? googleFontStack(googleFontName) : SYSTEM_FONTS[0].stack)
    : (SYSTEM_FONTS.find((f) => f.family === fontChoice)?.stack ?? SYSTEM_FONTS[0].stack);

  const config: MatConfig = useMemo(
    () => ({
      width,
      height,
      baseColor,
      fontStack,
      pattern,
      gradient,
      text: {
        headline: showHeadline ? headline : "",
        sideLabel: showSideLabel ? sideLabel : "",
        blurb: showBlurb ? blurb : "",
      },
      calendar: {
        enabled: showCalendar,
        month: calendarMonth,
        year: calendarYear,
        corner: calendarCorner,
      },
    }),
    [
      width,
      height,
      baseColor,
      fontStack,
      pattern,
      gradient,
      showHeadline,
      headline,
      showSideLabel,
      sideLabel,
      showBlurb,
      blurb,
      showCalendar,
      calendarMonth,
      calendarYear,
      calendarCorner,
    ],
  );

  const handleLoadGoogleFont = async () => {
    const name = googleFontInput.trim();
    if (!name) return;
    setGoogleFontStatus("loading");
    try {
      await loadGoogleFont(name);
      setGoogleFontName(name);
      setGoogleFontStatus("idle");
    } catch {
      setGoogleFontStatus("error");
    }
  };

  const handleExport = () => {
    const safeLabel = config.text.headline.trim()
      ? config.text.headline.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : "cutting-mat";
    exportMatAsPng(config, `${safeLabel}-${width}x${height}.png`);
  };

  return (
    <div className="app">
      <aside className="panel">
        <h1>Cutting Mat Wallpaper</h1>

        <section>
          <h2>Resolution</h2>
          <label className="field">
            <span>Preset</span>
            <select value={presetLabel} onChange={(e) => setPresetLabel(e.target.value)}>
              {RESOLUTION_PRESETS.map((p) => (
                <option key={p.label} value={p.label}>
                  {p.label}
                </option>
              ))}
              <option value={CUSTOM_PRESET}>Custom…</option>
            </select>
          </label>
          {isCustom && (
            <div className="field-row">
              <label className="field">
                <span>Width</span>
                <input
                  type="number"
                  min={64}
                  max={8000}
                  value={customWidth}
                  onChange={(e) => setCustomWidth(Number(e.target.value))}
                />
              </label>
              <label className="field">
                <span>Height</span>
                <input
                  type="number"
                  min={64}
                  max={8000}
                  value={customHeight}
                  onChange={(e) => setCustomHeight(Number(e.target.value))}
                />
              </label>
            </div>
          )}
        </section>

        <section>
          <h2>Pattern</h2>
          <label className="field">
            <span>Mat style</span>
            <select value={pattern} onChange={(e) => setPattern(e.target.value as MatPattern)}>
              {PATTERN_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Background texture</span>
            <select value={gradient} onChange={(e) => setGradient(e.target.value as MatGradient)}>
              {GRADIENT_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section>
          <h2>Color</h2>
          <label className="field field-color">
            <span>Mat color</span>
            <input type="color" value={baseColor} onChange={(e) => setBaseColor(e.target.value)} />
          </label>
          <div className="swatch-row">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                className={`swatch${baseColor.toLowerCase() === preset.value ? " swatch-active" : ""}`}
                style={{ backgroundColor: preset.value }}
                title={preset.label}
                aria-label={preset.label}
                onClick={() => setBaseColor(preset.value)}
              />
            ))}
          </div>
        </section>

        <section>
          <h2>Font</h2>
          <label className="field">
            <span>Typeface</span>
            <select value={fontChoice} onChange={(e) => setFontChoice(e.target.value)}>
              {SYSTEM_FONTS.map((f) => (
                <option key={f.family} value={f.family}>
                  {f.label}
                </option>
              ))}
              <option value={CUSTOM_GOOGLE_FONT}>Google Font…</option>
            </select>
          </label>
          {isGoogleFont && (
            <div className="field-row">
              <input
                className="field-input"
                style={{ marginBottom: 0 }}
                type="text"
                value={googleFontInput}
                onChange={(e) => setGoogleFontInput(e.target.value)}
                placeholder="e.g. Playfair Display"
              />
              <button
                type="button"
                className="load-font-btn"
                onClick={handleLoadGoogleFont}
                disabled={googleFontStatus === "loading" || !googleFontInput.trim()}
              >
                {googleFontStatus === "loading" ? "Loading…" : "Load"}
              </button>
            </div>
          )}
          {isGoogleFont && googleFontStatus === "error" && (
            <p className="field-error">Couldn't find that font on Google Fonts.</p>
          )}
          {isGoogleFont && googleFontName && googleFontStatus !== "loading" && (
            <p className="field-hint">Using "{googleFontName}".</p>
          )}
        </section>

        <section>
          <h2>Text</h2>

          <label className="field-toggle">
            <input type="checkbox" checked={showHeadline} onChange={(e) => setShowHeadline(e.target.checked)} />
            <span>Center headline</span>
          </label>
          {showHeadline && (
            <input
              className="field-input"
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Stay Focused."
            />
          )}

          <label className="field-toggle">
            <input type="checkbox" checked={showSideLabel} onChange={(e) => setShowSideLabel(e.target.checked)} />
            <span>Vertical side label</span>
          </label>
          {showSideLabel && (
            <input
              className="field-input"
              type="text"
              value={sideLabel}
              onChange={(e) => setSideLabel(e.target.value)}
              placeholder="CUTTING MAT — 2026"
            />
          )}

          <label className="field-toggle">
            <input type="checkbox" checked={showBlurb} onChange={(e) => setShowBlurb(e.target.checked)} />
            <span>Bottom-right blurb</span>
          </label>
          {showBlurb && (
            <textarea
              className="field-input"
              rows={4}
              value={blurb}
              onChange={(e) => setBlurb(e.target.value)}
              placeholder="Add a short paragraph…"
            />
          )}
        </section>

        <section>
          <h2>Calendar</h2>
          <label className="field-toggle">
            <input type="checkbox" checked={showCalendar} onChange={(e) => setShowCalendar(e.target.checked)} />
            <span>Show calendar</span>
          </label>
          {showCalendar && (
            <>
              <div className="field-row">
                <label className="field">
                  <span>Month</span>
                  <select value={calendarMonth} onChange={(e) => setCalendarMonth(Number(e.target.value))}>
                    {MONTH_NAMES.map((name, i) => (
                      <option key={name} value={i}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Year</span>
                  <input
                    type="number"
                    min={1900}
                    max={2999}
                    value={calendarYear}
                    onChange={(e) => setCalendarYear(Number(e.target.value))}
                  />
                </label>
              </div>
              <label className="field">
                <span>Corner</span>
                <select value={calendarCorner} onChange={(e) => setCalendarCorner(e.target.value as CalendarCorner)}>
                  {CORNER_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
        </section>

        <button className="export-btn" onClick={handleExport}>
          Download PNG ({width}×{height})
        </button>
      </aside>

      <main className="preview-area">
        <div className="preview-frame" style={{ aspectRatio: `${width} / ${height}` }}>
          <MatPreview config={config} />
        </div>
      </main>
    </div>
  );
}
