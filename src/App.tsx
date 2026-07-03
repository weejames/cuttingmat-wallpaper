import { useMemo, useState } from "react";
import { MatPreview } from "./MatPreview";
import { exportMatAsPng } from "./export";
import { DEFAULT_TEXT, RESOLUTION_PRESETS } from "./types";
import type { MatConfig } from "./types";

const CUSTOM_PRESET = "custom";

export default function App() {
  const [presetLabel, setPresetLabel] = useState(RESOLUTION_PRESETS[0].label);
  const [customWidth, setCustomWidth] = useState(1920);
  const [customHeight, setCustomHeight] = useState(1080);
  const [baseColor, setBaseColor] = useState("#0f7a5c");
  const [showHeadline, setShowHeadline] = useState(true);
  const [showSideLabel, setShowSideLabel] = useState(true);
  const [showBlurb, setShowBlurb] = useState(true);
  const [headline, setHeadline] = useState(DEFAULT_TEXT.headline);
  const [sideLabel, setSideLabel] = useState(DEFAULT_TEXT.sideLabel);
  const [blurb, setBlurb] = useState(DEFAULT_TEXT.blurb);

  const isCustom = presetLabel === CUSTOM_PRESET;
  const preset = RESOLUTION_PRESETS.find((p) => p.label === presetLabel);
  const width = isCustom ? customWidth : (preset?.width ?? 1920);
  const height = isCustom ? customHeight : (preset?.height ?? 1080);

  const config: MatConfig = useMemo(
    () => ({
      width,
      height,
      baseColor,
      text: {
        headline: showHeadline ? headline : "",
        sideLabel: showSideLabel ? sideLabel : "",
        blurb: showBlurb ? blurb : "",
      },
    }),
    [width, height, baseColor, showHeadline, headline, showSideLabel, sideLabel, showBlurb, blurb],
  );

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
          <h2>Color</h2>
          <label className="field field-color">
            <span>Mat color</span>
            <input type="color" value={baseColor} onChange={(e) => setBaseColor(e.target.value)} />
          </label>
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
