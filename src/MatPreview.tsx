import { useEffect, useRef } from "react";
import { renderMat } from "./renderMat";
import type { MatConfig } from "./types";

interface MatPreviewProps {
  config: MatConfig;
  className?: string;
}

export function MatPreview({ config, className }: MatPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      renderMat(canvasRef.current, config);
    }
  }, [config]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", objectFit: "contain" }}
    />
  );
}
