"use client";

import type { ReactNode } from "react";

type DashboardViewProps = {
  conversation: ReactNode;
  summary: ReactNode;
  lowerSections?: ReactNode;
};

export function DashboardView({ conversation, summary, lowerSections }: DashboardViewProps) {
  return (
    <div className="h-full overflow-y-auto px-4 py-4 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[minmax(0,1.35fr)_340px] lg:items-start">
        <div className="min-w-0 space-y-5">
          {conversation}
          {lowerSections}
        </div>
        <div className="min-w-0">{summary}</div>
      </div>
    </div>
  );
}
