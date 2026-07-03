import { derivePalette } from "./colors";
import type { MatConfig } from "./types";

const MARGIN_RATIO = 0.035;
const MAJOR_GRID_COLS = 10;
const MINOR_PER_MAJOR = 5;

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, palette: ReturnType<typeof derivePalette>) {
  const base = ctx.createLinearGradient(0, 0, w, h);
  base.addColorStop(0, palette.shadowEdge);
  base.addColorStop(0.5, palette.base);
  base.addColorStop(1, palette.shadowEdge);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  const rand = seededRandom(42);
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  for (let i = 0; i < 5; i++) {
    const x0 = rand() * w * 0.6;
    const bandWidth = w * (0.15 + rand() * 0.2);
    const sheen = ctx.createLinearGradient(x0, 0, x0 + bandWidth, h);
    sheen.addColorStop(0, "rgba(255,255,255,0)");
    sheen.addColorStop(0.5, palette.highlightSheen);
    sheen.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sheen;
    ctx.beginPath();
    ctx.moveTo(x0 - h * 0.3, 0);
    ctx.lineTo(x0 + bandWidth - h * 0.3, 0);
    ctx.lineTo(x0 + bandWidth + h * 0.3, h);
    ctx.lineTo(x0 + h * 0.3, h);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  const vignette = ctx.createRadialGradient(
    w / 2,
    h / 2,
    Math.min(w, h) * 0.2,
    w / 2,
    h / 2,
    Math.max(w, h) * 0.75,
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  palette: ReturnType<typeof derivePalette>,
) {
  const majorStepX = w / MAJOR_GRID_COLS;
  const rows = Math.round(h / majorStepX);
  const majorStepY = h / rows;
  const minorStepX = majorStepX / MINOR_PER_MAJOR;
  const minorStepY = majorStepY / MINOR_PER_MAJOR;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  ctx.strokeStyle = palette.gridMinor;
  ctx.lineWidth = Math.max(1, w * 0.0004);
  for (let gx = x; gx <= x + w + 1; gx += minorStepX) {
    ctx.beginPath();
    ctx.moveTo(gx, y);
    ctx.lineTo(gx, y + h);
    ctx.stroke();
  }
  for (let gy = y; gy <= y + h + 1; gy += minorStepY) {
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.lineTo(x + w, gy);
    ctx.stroke();
  }

  ctx.strokeStyle = palette.gridMajor;
  ctx.lineWidth = Math.max(1.5, w * 0.0009);
  for (let gx = x; gx <= x + w + 1; gx += majorStepX) {
    ctx.beginPath();
    ctx.moveTo(gx, y);
    ctx.lineTo(gx, y + h);
    ctx.stroke();
  }
  for (let gy = y; gy <= y + h + 1; gy += majorStepY) {
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.lineTo(x + w, gy);
    ctx.stroke();
  }

  ctx.strokeStyle = palette.gridMajor;
  ctx.lineWidth = Math.max(1.5, w * 0.0012);
  ctx.beginPath();
  const diagLen = Math.min(w, h) * 0.62;
  ctx.moveTo(x, y + h);
  ctx.lineTo(x + diagLen, y + h - diagLen);
  ctx.stroke();

  ctx.strokeStyle = palette.gridDotted;
  ctx.lineWidth = Math.max(0.75, w * 0.0003);
  ctx.setLineDash([w * 0.002, w * 0.006]);
  for (let gx = x; gx <= x + w; gx += majorStepX) {
    ctx.beginPath();
    ctx.moveTo(gx + majorStepX * 0.5, y);
    ctx.lineTo(gx + majorStepX * 0.5, y + h);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  ctx.restore();
}

function drawBorder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  palette: ReturnType<typeof derivePalette>,
) {
  ctx.save();
  ctx.strokeStyle = palette.textPrimary;
  ctx.lineWidth = Math.max(1.5, w * 0.0015);
  ctx.strokeRect(x, y, w, h);

  const tickSpacing = w * 0.01;
  const tickLen = w * 0.004;
  ctx.fillStyle = palette.textSecondary;
  for (let gx = x; gx <= x + w; gx += tickSpacing) {
    ctx.fillRect(gx, y - tickLen * 2, Math.max(1, w * 0.0006), tickLen);
    ctx.fillRect(gx, y + h + tickLen, Math.max(1, w * 0.0006), tickLen);
  }
  for (let gy = y; gy <= y + h; gy += tickSpacing) {
    ctx.fillRect(x - tickLen * 2, gy, tickLen, Math.max(1, w * 0.0006));
    ctx.fillRect(x + w + tickLen, gy, tickLen, Math.max(1, w * 0.0006));
  }
  ctx.restore();
}

function drawHeadline(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  text: string,
  matWidth: number,
  palette: ReturnType<typeof derivePalette>,
  fontStack: string,
) {
  const fontSize = Math.round(matWidth * 0.028);
  ctx.save();
  ctx.font = `${fontSize}px ${fontStack}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const paddingX = fontSize * 1.1;
  const paddingY = fontSize * 0.7;
  const metrics = ctx.measureText(text);
  const boxW = metrics.width + paddingX * 2;
  const boxH = fontSize + paddingY * 2;

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(cx - boxW / 2, cy - boxH / 2, boxW, boxH);

  ctx.fillStyle = palette.textPrimary;
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = fontSize * 0.15;
  ctx.fillText(text, cx, cy + fontSize * 0.05);
  ctx.restore();
}

function drawSideLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  h: number,
  text: string,
  matWidth: number,
  palette: ReturnType<typeof derivePalette>,
  fontStack: string,
) {
  const fontSize = Math.round(matWidth * 0.0075);
  ctx.save();
  ctx.translate(x, y + h);
  ctx.rotate(-Math.PI / 2);
  ctx.font = `${fontSize}px ${fontStack}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillStyle = palette.textSecondary;
  ctx.letterSpacing = `${fontSize * 0.15}px`;
  ctx.fillText(text.toUpperCase(), fontSize * 1.2, -fontSize * 0.6);
  ctx.restore();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawBlurb(
  ctx: CanvasRenderingContext2D,
  right: number,
  bottom: number,
  text: string,
  matWidth: number,
  palette: ReturnType<typeof derivePalette>,
  fontStack: string,
) {
  const fontSize = Math.round(matWidth * 0.0072);
  const lineHeight = fontSize * 1.5;
  const maxWidth = matWidth * 0.24;

  ctx.save();
  ctx.font = `${fontSize}px ${fontStack}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = palette.textSecondary;

  const lines = wrapText(ctx, text, maxWidth);
  const startY = bottom - lineHeight * (lines.length - 1);
  lines.forEach((line, i) => {
    ctx.fillText(line, right, startY + i * lineHeight);
  });
  ctx.restore();
}

export function renderMat(canvas: HTMLCanvasElement, config: MatConfig): void {
  const { width, height, baseColor, fontStack, text } = config;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const palette = derivePalette(baseColor);

  drawBackground(ctx, width, height, palette);

  const margin = Math.round(Math.min(width, height) * MARGIN_RATIO);
  const gridX = margin;
  const gridY = margin;
  const gridW = width - margin * 2;
  const gridH = height - margin * 2;

  drawGrid(ctx, gridX, gridY, gridW, gridH, palette);
  drawBorder(ctx, gridX, gridY, gridW, gridH, palette);

  if (text.sideLabel.trim()) {
    drawSideLabel(ctx, gridX, gridY, gridH, text.sideLabel, width, palette, fontStack);
  }

  if (text.headline.trim()) {
    drawHeadline(ctx, width / 2, height / 2, text.headline, width, palette, fontStack);
  }

  if (text.blurb.trim()) {
    drawBlurb(ctx, gridX + gridW - width * 0.012, gridY + gridH - width * 0.012, text.blurb, width, palette, fontStack);
  }
}
