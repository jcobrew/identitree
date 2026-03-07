"use client";

import { Card, CardBody, CardHeader } from "@heroui/react";
import type { ReactNode } from "react";

type SummarySection = {
  key: string;
  eyebrow: string;
  title?: string;
  content: ReactNode;
};

type SummaryRailProps = {
  title: string;
  subtitle: string;
  sections: SummarySection[];
};

export function SummaryRail({ title, subtitle, sections }: SummaryRailProps) {
  return (
    <div className="space-y-4 lg:sticky lg:top-4">
      <Card className="border border-zinc-800/10 bg-[#fbf6ee] shadow-[0_12px_30px_rgba(71,52,35,0.08)]">
        <CardHeader className="flex-col items-start gap-2 border-b border-zinc-800/8 pb-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">summary rail</p>
          <h3 className="font-[family-name:var(--font-instrument-serif)] text-3xl leading-none text-zinc-900">
            {title}
          </h3>
          <p className="text-sm leading-relaxed text-zinc-600">{subtitle}</p>
        </CardHeader>
        <CardBody className="gap-4 p-4">
          {sections.map((section) => (
            <div key={section.key} className="rounded-[28px] border border-zinc-800/8 bg-[#f7f0e4] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.58)]">
              <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{section.eyebrow}</p>
              {section.title && (
                <p className="mt-2 font-[family-name:var(--font-instrument-serif)] text-2xl leading-none text-zinc-900">
                  {section.title}
                </p>
              )}
              <div className="mt-3 text-sm leading-relaxed text-zinc-700">{section.content}</div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
