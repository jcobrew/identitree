"use client";

import { Button } from "@heroui/react";

type WorkspaceView = "dashboard" | "graph";

type ViewToggleProps = {
  value: WorkspaceView;
  onChange: (value: WorkspaceView) => void;
};

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center rounded-full border border-zinc-800/15 bg-[#f4ecdf] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
      <Button
        size="sm"
        radius="full"
        variant={value === "dashboard" ? "solid" : "light"}
        className={value === "dashboard" ? "bg-zinc-900 text-white" : "text-zinc-600"}
        onPress={() => onChange("dashboard")}
      >
        dashboard
      </Button>
      <Button
        size="sm"
        radius="full"
        variant={value === "graph" ? "solid" : "light"}
        className={value === "graph" ? "bg-zinc-900 text-white" : "text-zinc-600"}
        onPress={() => onChange("graph")}
      >
        graph
      </Button>
    </div>
  );
}
