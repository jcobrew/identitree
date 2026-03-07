"use client";

import { Button, Card, CardBody, CardHeader, Chip } from "@heroui/react";
import type { CheckInCard } from "@/lib/identitree/types";

const chipTone: Record<CheckInCard["kind"], string> = {
  light: "bg-[#ece8df] text-[#433d35]",
  "catch-up": "bg-[#f3ead5] text-[#5f4d33]",
  "tree-prompted": "bg-[#e0e8ef] text-[#2f4e67]",
  continue: "bg-[#e6ece3] text-[#385345]",
};

export function CheckInCardGrid({
  cards,
  onPress,
}: {
  cards: CheckInCard[];
  onPress: (card: CheckInCard) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.id}
          className="border border-black/5 bg-white/85 shadow-[0_20px_50px_rgba(32,24,18,0.05)]"
        >
          <CardHeader className="flex items-start justify-between gap-3 pb-2">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-black/35">check-in</p>
              <h3 className="mt-2 font-[family-name:var(--font-instrument-serif)] text-[1.55rem] leading-none text-[#171411]">
                {card.title}
              </h3>
            </div>
            <Chip radius="full" className={`border-none ${chipTone[card.kind]} text-[10px] uppercase tracking-[0.18em]`}>
              {card.kind}
            </Chip>
          </CardHeader>
          <CardBody className="gap-5 pt-0">
            <p className="text-sm leading-7 text-black/60">{card.body}</p>
            <Button
              radius="full"
              className="w-fit bg-[#171411] px-5 text-white shadow-none"
              onPress={() => onPress(card)}
            >
              {card.actionLabel}
            </Button>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
