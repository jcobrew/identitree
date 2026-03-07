"use client";

import type { ReactNode } from "react";

type GraphViewProps = {
  canvas: ReactNode;
  preview?: ReactNode;
};

export function GraphView({ canvas, preview }: GraphViewProps) {
  return (
    <div className="relative h-full w-full px-3 pb-3 pt-3 sm:px-4 sm:pb-4">
      {canvas}
      {preview}
    </div>
  );
}
