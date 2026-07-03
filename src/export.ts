import { renderMat } from "./renderMat";
import type { MatConfig } from "./types";

export function exportMatAsPng(config: MatConfig, filename: string): void {
  const canvas = document.createElement("canvas");
  renderMat(canvas, config);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}
