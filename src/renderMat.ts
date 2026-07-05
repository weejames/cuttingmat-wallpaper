import { derivePalette } from "./colors";
import type { CalendarConfig, MatConfig, MatGradient, MatPattern } from "./types";

const MARGIN_RATIO = 0.035;
const MAJOR_GRID_COLS = 10;
const MINOR_PER_MAJOR = 5;

type Palette = ReturnType<typeof derivePalette>;

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

function drawVignette(ctx: CanvasRenderingContext2D, w: number, h: number, strength = 0.35) {
  const vignette = ctx.createRadialGradient(
    w / 2,
    h / 2,
    Math.min(w, h) * 0.2,
    w / 2,
    h / 2,
    Math.max(w, h) * 0.75,
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
}

function fillBaseGradient(ctx: CanvasRenderingContext2D, w: number, h: number, palette: Palette) {
  const base = ctx.createLinearGradient(0, 0, w, h);
  base.addColorStop(0, palette.shadowEdge);
  base.addColorStop(0.5, palette.base);
  base.addColorStop(1, palette.shadowEdge);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
}

function drawDiagonalSheen(ctx: CanvasRenderingContext2D, w: number, h: number, palette: Palette) {
  fillBaseGradient(ctx, w, h, palette);

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

  drawVignette(ctx, w, h, 0.35);
}

function drawPlantShadow(ctx: CanvasRenderingContext2D, w: number, h: number, palette: Palette) {
  fillBaseGradient(ctx, w, h, palette);

  const rand = seededRandom(137);
  const diag = Math.hypot(w, h);

  const shadowLayer = document.createElement("canvas");
  shadowLayer.width = w;
  shadowLayer.height = h;
  const sctx = shadowLayer.getContext("2d");
  if (sctx) {
    sctx.filter = `blur(${diag * 0.02}px)`;
    const clusterCount = 3 + Math.floor(rand() * 2);
    for (let c = 0; c < clusterCount; c++) {
      const cx = rand() * w;
      const cy = rand() * h * 0.75;
      const clusterRadius = diag * (0.11 + rand() * 0.08);
      const leafCount = 4 + Math.floor(rand() * 3);

      for (let i = 0; i < leafCount; i++) {
        const angle = rand() * Math.PI * 2;
        const dist = rand() * clusterRadius * 0.7;
        const lx = cx + Math.cos(angle) * dist;
        const ly = cy + Math.sin(angle) * dist * 0.6;
        const leafW = clusterRadius * (0.45 + rand() * 0.4);
        const leafH = leafW * (1.5 + rand() * 0.7);
        const rot = rand() * Math.PI;

        sctx.save();
        sctx.translate(lx, ly);
        sctx.rotate(rot);
        const leafGrad = sctx.createRadialGradient(0, 0, 0, 0, 0, leafH / 2);
        leafGrad.addColorStop(0, "rgba(0,0,0,0.5)");
        leafGrad.addColorStop(1, "rgba(0,0,0,0)");
        sctx.fillStyle = leafGrad;
        sctx.beginPath();
        sctx.ellipse(0, 0, leafW / 2, leafH / 2, 0, 0, Math.PI * 2);
        sctx.fill();
        sctx.restore();
      }
    }
  }

  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.22;
  ctx.drawImage(shadowLayer, 0, 0);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = 0.25;
  const dapple = ctx.createRadialGradient(w * 0.3, h * 0.25, 0, w * 0.3, h * 0.25, diag * 0.5);
  dapple.addColorStop(0, palette.highlightSheen);
  dapple.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = dapple;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  drawVignette(ctx, w, h, 0.28);
}

function drawSoftBlend(ctx: CanvasRenderingContext2D, w: number, h: number, palette: Palette) {
  fillBaseGradient(ctx, w, h, palette);

  const rand = seededRandom(271);
  const diag = Math.hypot(w, h);

  ctx.save();
  ctx.globalCompositeOperation = "soft-light";
  const points: Array<[number, number, string]> = [
    [w * 0.15, h * 0.2, palette.highlightSheen],
    [w * 0.85, h * 0.15, palette.highlightSheen],
    [w * 0.75, h * 0.85, palette.shadowEdge],
    [w * 0.2, h * 0.8, palette.shadowEdge],
  ];
  for (const [px, py, color] of points) {
    const radius = diag * (0.35 + rand() * 0.15);
    const blob = ctx.createRadialGradient(px, py, 0, px, py, radius);
    blob.addColorStop(0, color);
    blob.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = blob;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();

  drawVignette(ctx, w, h, 0.22);
}

function drawSpotlight(ctx: CanvasRenderingContext2D, w: number, h: number, palette: Palette) {
  ctx.fillStyle = palette.shadowEdge;
  ctx.fillRect(0, 0, w, h);

  const cx = w * 0.38;
  const cy = h * 0.32;
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.75);
  glow.addColorStop(0, palette.highlightSheen);
  glow.addColorStop(0.35, palette.base);
  glow.addColorStop(1, palette.shadowEdge);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  drawVignette(ctx, w, h, 0.5);
}

function drawAuroraWaves(ctx: CanvasRenderingContext2D, w: number, h: number, palette: Palette) {
  fillBaseGradient(ctx, w, h, palette);

  const rand = seededRandom(613);
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const ribbonCount = 4;
  for (let i = 0; i < ribbonCount; i++) {
    const baseY = h * (0.15 + (i / ribbonCount) * 0.7);
    const amplitude = h * (0.08 + rand() * 0.06);
    const thickness = h * (0.09 + rand() * 0.05);
    const phase = rand() * Math.PI * 2;

    ctx.strokeStyle = palette.highlightSheen;
    ctx.lineWidth = thickness;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    const steps = 48;
    for (let s = 0; s <= steps; s++) {
      const x = (s / steps) * w;
      const y = baseY + Math.sin(phase + (s / steps) * Math.PI * 2.2) * amplitude;
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();

  drawVignette(ctx, w, h, 0.4);
}

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, palette: Palette, gradient: MatGradient) {
  switch (gradient) {
    case "plant-shadow":
      return drawPlantShadow(ctx, w, h, palette);
    case "soft-blend":
      return drawSoftBlend(ctx, w, h, palette);
    case "spotlight":
      return drawSpotlight(ctx, w, h, palette);
    case "aurora-waves":
      return drawAuroraWaves(ctx, w, h, palette);
    case "diagonal-sheen":
    default:
      return drawDiagonalSheen(ctx, w, h, palette);
  }
}

function gridSteps(w: number, h: number) {
  const majorStepX = w / MAJOR_GRID_COLS;
  const rows = Math.round(h / majorStepX);
  const majorStepY = h / rows;
  const minorStepX = majorStepX / MINOR_PER_MAJOR;
  const minorStepY = majorStepY / MINOR_PER_MAJOR;
  return { majorStepX, majorStepY, minorStepX, minorStepY };
}

function drawMinorLines(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  minorStepX: number,
  minorStepY: number,
  palette: Palette,
) {
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
}

function drawMajorLines(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  majorStepX: number,
  majorStepY: number,
  palette: Palette,
) {
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
}

function drawClassicGrid(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, palette: Palette) {
  const { majorStepX, majorStepY, minorStepX, minorStepY } = gridSteps(w, h);

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  drawMinorLines(ctx, x, y, w, h, minorStepX, minorStepY, palette);
  drawMajorLines(ctx, x, y, w, h, majorStepX, majorStepY, palette);

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

function drawPlainGrid(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, palette: Palette) {
  const { majorStepX, majorStepY, minorStepX, minorStepY } = gridSteps(w, h);

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  drawMinorLines(ctx, x, y, w, h, minorStepX, minorStepY, palette);
  drawMajorLines(ctx, x, y, w, h, majorStepX, majorStepY, palette);

  ctx.restore();
}

function drawDotGrid(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, palette: Palette) {
  const { majorStepX, majorStepY, minorStepX, minorStepY } = gridSteps(w, h);
  const dotRadius = Math.max(1, w * 0.0016);
  const majorDotRadius = Math.max(1.4, w * 0.0026);

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  ctx.fillStyle = palette.gridMinor;
  for (let gx = x; gx <= x + w + 1; gx += minorStepX) {
    for (let gy = y; gy <= y + h + 1; gy += minorStepY) {
      ctx.beginPath();
      ctx.arc(gx, gy, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = palette.gridMajor;
  for (let gx = x; gx <= x + w + 1; gx += majorStepX) {
    for (let gy = y; gy <= y + h + 1; gy += majorStepY) {
      ctx.beginPath();
      ctx.arc(gx, gy, majorDotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

function drawIsometricGrid(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, palette: Palette) {
  const step = w / MAJOR_GRID_COLS;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  ctx.strokeStyle = palette.gridMajor;
  ctx.lineWidth = Math.max(1, w * 0.0007);

  const diagStep = step;
  const tan60 = Math.tan(Math.PI / 3);
  const span = w + h / tan60;
  for (let offset = -h / tan60; offset <= span; offset += diagStep) {
    ctx.beginPath();
    ctx.moveTo(x + offset, y + h);
    ctx.lineTo(x + offset + h / tan60, y);
    ctx.stroke();
  }
  for (let offset = -h / tan60; offset <= span; offset += diagStep) {
    ctx.beginPath();
    ctx.moveTo(x + offset, y);
    ctx.lineTo(x + offset + h / tan60, y + h);
    ctx.stroke();
  }

  ctx.strokeStyle = palette.gridMinor;
  ctx.lineWidth = Math.max(0.75, w * 0.0004);
  for (let gy = y; gy <= y + h + 1; gy += diagStep * (tan60 / 2)) {
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.lineTo(x + w, gy);
    ctx.stroke();
  }

  ctx.restore();
}

function drawConcentricGrid(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, palette: Palette) {
  const { majorStepX, majorStepY, minorStepX, minorStepY } = gridSteps(w, h);

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  drawMinorLines(ctx, x, y, w, h, minorStepX, minorStepY, palette);
  drawMajorLines(ctx, x, y, w, h, majorStepX, majorStepY, palette);

  const cx = x + w / 2;
  const cy = y + h / 2;
  const maxRadius = Math.min(w, h) * 0.62;
  const ringStep = maxRadius / 6;

  ctx.strokeStyle = palette.gridMajor;
  ctx.lineWidth = Math.max(1, w * 0.001);
  for (let r = ringStep; r <= maxRadius + 1; r += ringStep) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = palette.gridDotted;
  ctx.lineWidth = Math.max(0.75, w * 0.0003);
  const spokeCount = 12;
  for (let i = 0; i < spokeCount; i++) {
    const angle = (i / spokeCount) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * maxRadius, cy + Math.sin(angle) * maxRadius);
    ctx.stroke();
  }

  ctx.restore();
}

function drawPattern(
  pattern: MatPattern,
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  palette: Palette,
) {
  switch (pattern) {
    case "plain-grid":
      return drawPlainGrid(ctx, x, y, w, h, palette);
    case "dot-grid":
      return drawDotGrid(ctx, x, y, w, h, palette);
    case "isometric":
      return drawIsometricGrid(ctx, x, y, w, h, palette);
    case "concentric":
      return drawConcentricGrid(ctx, x, y, w, h, palette);
    case "classic":
    default:
      return drawClassicGrid(ctx, x, y, w, h, palette);
  }
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

function drawAxisNumbers(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  matWidth: number,
  palette: Palette,
  fontStack: string,
) {
  const { majorStepX, majorStepY } = gridSteps(w, h);
  const fontSize = Math.round(matWidth * 0.009);
  const offset = matWidth * 0.014;

  ctx.save();
  ctx.font = `${fontSize}px ${fontStack}`;
  ctx.fillStyle = palette.textPrimary;

  const colCount = Math.round(w / majorStepX);
  ctx.textAlign = "center";
  for (let i = 0; i <= colCount; i++) {
    const gx = x + i * majorStepX;
    ctx.textBaseline = "bottom";
    ctx.fillText(String(i), gx, y - offset);
    ctx.textBaseline = "top";
    ctx.fillText(String(i), gx, y + h + offset);
  }

  const rowCount = Math.round(h / majorStepY);
  ctx.textBaseline = "middle";
  for (let i = 0; i <= rowCount; i++) {
    const gy = y + h - i * majorStepY;
    ctx.textAlign = "right";
    ctx.fillText(String(i), x - offset, gy);
    ctx.textAlign = "left";
    ctx.fillText(String(i), x + w + offset, gy);
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
const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function buildCalendarWeeks(month: number, year: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const mondayIndexedStart = (firstDay.getDay() + 6) % 7;

  const cells: (number | null)[] = [];
  for (let i = 0; i < mondayIndexedStart; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

function drawCalendar(
  ctx: CanvasRenderingContext2D,
  gridX: number,
  gridY: number,
  gridW: number,
  gridH: number,
  matWidth: number,
  palette: Palette,
  fontStack: string,
  calendar: CalendarConfig,
) {
  const weeks = buildCalendarWeeks(calendar.month, calendar.year);
  const cellSize = matWidth * 0.026;
  const colGap = 0;
  const rowGap = cellSize * 0.12;
  const headerFontSize = Math.round(matWidth * 0.0095);
  const cellFontSize = Math.round(matWidth * 0.0088);
  const inset = matWidth * 0.012;

  const tableW = cellSize * 7;
  const tableH = (headerFontSize * 1.6) + (cellSize + rowGap) * weeks.length;

  let originX: number;
  let originY: number;
  switch (calendar.corner) {
    case "top-left":
      originX = gridX + inset;
      originY = gridY + inset;
      break;
    case "top-right":
      originX = gridX + gridW - inset - tableW;
      originY = gridY + inset;
      break;
    case "bottom-left":
      originX = gridX + inset;
      originY = gridY + gridH - inset - tableH;
      break;
    case "bottom-right":
    default:
      originX = gridX + gridW - inset - tableW;
      originY = gridY + gridH - inset - tableH;
      break;
  }

  ctx.save();
  ctx.font = `600 ${headerFontSize}px ${fontStack}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = palette.textPrimary;
  ctx.fillText(`${MONTH_NAMES[calendar.month]} ${calendar.year}`, originX, originY);

  const weekdayY = originY + headerFontSize * 1.5;
  ctx.font = `${cellFontSize * 0.8}px ${fontStack}`;
  ctx.fillStyle = palette.textSecondary;
  ctx.textAlign = "center";
  WEEKDAY_LABELS.forEach((label, col) => {
    const cx = originX + col * (cellSize + colGap) + cellSize / 2;
    ctx.fillText(label, cx, weekdayY);
  });

  const gridStartY = weekdayY + cellFontSize * 1.1;
  ctx.font = `${cellFontSize}px ${fontStack}`;
  weeks.forEach((week, row) => {
    const cy = gridStartY + row * (cellSize + rowGap) + cellSize / 2;
    week.forEach((day, col) => {
      if (day === null) return;
      const cx = originX + col * (cellSize + colGap) + cellSize / 2;
      ctx.fillStyle = palette.textSecondary;
      ctx.fillText(String(day), cx, cy);
    });
  });

  ctx.restore();
}

export function renderMat(canvas: HTMLCanvasElement, config: MatConfig): void {
  const { width, height, baseColor, fontStack, pattern, gradient, showAxisNumbers, text, calendar } = config;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const palette = derivePalette(baseColor);

  drawBackground(ctx, width, height, palette, gradient);

  const marginRatio = showAxisNumbers ? MARGIN_RATIO * 2 : MARGIN_RATIO;
  const margin = Math.round(Math.min(width, height) * marginRatio);
  const gridX = margin;
  const gridY = margin;
  const gridW = width - margin * 2;
  const gridH = height - margin * 2;

  drawPattern(pattern, ctx, gridX, gridY, gridW, gridH, palette);
  drawBorder(ctx, gridX, gridY, gridW, gridH, palette);

  if (showAxisNumbers) {
    drawAxisNumbers(ctx, gridX, gridY, gridW, gridH, width, palette, fontStack);
  }

  if (text.sideLabel.trim()) {
    drawSideLabel(ctx, gridX, gridY, gridH, text.sideLabel, width, palette, fontStack);
  }

  if (text.headline.trim()) {
    drawHeadline(ctx, width / 2, height / 2, text.headline, width, palette, fontStack);
  }

  if (text.blurb.trim()) {
    drawBlurb(ctx, gridX + gridW - width * 0.012, gridY + gridH - width * 0.012, text.blurb, width, palette, fontStack);
  }

  if (calendar.enabled) {
    drawCalendar(ctx, gridX, gridY, gridW, gridH, width, palette, fontStack, calendar);
  }
}
