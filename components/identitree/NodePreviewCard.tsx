"use client";

import { Button, Card, CardBody, CardHeader } from "@heroui/react";

type NodePreviewCardProps = {
  eyebrow: string;
  title: string;
  summary: string;
  meaning: string;
  onOpenDashboard: () => void;
  onTalkToGuide: () => void;
};

export function NodePreviewCard({
  eyebrow,
  title,
  summary,
  meaning,
  onOpenDashboard,
  onTalkToGuide,
}: NodePreviewCardProps) {
  return (
    <Card className="w-[340px] max-w-[calc(100vw-2rem)] border border-zinc-800/10 bg-[#fbf6ee]/96 shadow-[0_18px_42px_rgba(71,52,35,0.2)] backdrop-blur-sm">
      <CardHeader className="flex-col items-start gap-2 border-b border-zinc-800/8 pb-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{eyebrow}</p>
        <h3 className="font-[family-name:var(--font-instrument-serif)] text-3xl leading-none text-zinc-900">{title}</h3>
      </CardHeader>
      <CardBody className="gap-4 p-4">
        <p className="text-sm leading-relaxed text-zinc-700">{summary}</p>
        <div className="rounded-[24px] border border-zinc-800/8 bg-[#f7f0e4] p-4 text-sm leading-relaxed text-zinc-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.58)]">
          {meaning}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="flat" onPress={onOpenDashboard}>
            open in dashboard
          </Button>
          <Button size="sm" color="warning" onPress={onTalkToGuide}>
            talk to guide about this
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
