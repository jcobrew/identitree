"use client";

import { Button, Card, CardBody, CardHeader, Chip } from "@heroui/react";
import type { CheckInCard } from "@/lib/identitree/types";
import { CheckInCardGrid } from "@/components/identitree/CheckInCardGrid";

type LandingThreadSummary = {
  id: string;
  title: string;
  topic: string;
  preview: string;
  nodeCount: number;
  touchedLabel: string;
  isActive: boolean;
};

type LandingNote = {
  title: string;
  body: string;
};

type LandingEntry = {
  title: string;
  body: string;
  actionLabel: string;
  meta: string;
};

export function LandingView({
  isReturning,
  cards,
  featuredCard,
  secondaryCard,
  featuredEntry,
  secondaryEntry,
  notes,
  recentThreads,
  treePreview,
  onStartReflection,
  onOpenTree,
  onOpenThreadSwitcher,
  onCardPress,
  onOpenRecentThread,
}: {
  isReturning: boolean;
  cards: CheckInCard[];
  featuredCard?: CheckInCard | null;
  secondaryCard?: CheckInCard | null;
  featuredEntry: LandingEntry;
  secondaryEntry?: LandingEntry | null;
  notes: LandingNote[];
  recentThreads: LandingThreadSummary[];
  treePreview: React.ReactNode;
  onStartReflection: () => void;
  onOpenTree: () => void;
  onOpenThreadSwitcher: () => void;
  onCardPress: (card: CheckInCard) => void;
  onOpenRecentThread: (threadId: string) => void;
}) {
  return (
    <div className="min-h-screen bg-[#f6f3ed] px-4 py-5 text-[#171411] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-6 rounded-[28px] bg-white/80 px-6 py-6 shadow-[0_20px_50px_rgba(32,24,18,0.05)] ring-1 ring-black/5 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-black/35">identitree v3</p>
            <h1 className="max-w-3xl font-[family-name:var(--font-instrument-serif)] text-5xl leading-[0.92] tracking-[-0.03em] sm:text-6xl">
              {isReturning
                ? "your next way back in should feel obvious."
                : "a calmer home for reflection, threads, and the tree they feed."}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-black/62 sm:text-lg">
              {isReturning
                ? "come back through the room with the most heat, or follow the strongest signal already forming in the tree."
                : "the mirror holds one thread at a time. the architect keeps shaping one shared identity tree underneath it."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button radius="full" className="bg-[#171411] px-6 text-white" onPress={onStartReflection}>
              {isReturning ? "continue reflection" : "start reflection"}
            </Button>
            <Button radius="full" variant="flat" className="bg-black/5 text-[#171411]" onPress={onOpenTree}>
              open tree
            </Button>
            <Button radius="full" variant="light" className="text-[#171411]" onPress={onOpenThreadSwitcher}>
              threads
            </Button>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_420px]">
          <Card className="overflow-hidden border border-black/5 bg-white/82 shadow-[0_20px_50px_rgba(32,24,18,0.05)]">
            <CardHeader className="flex-col items-start gap-3 border-b border-black/6 pb-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-black/35">landing preview</p>
              <h2 className="font-[family-name:var(--font-instrument-serif)] text-[2rem] leading-none text-[#171411]">
                {isReturning ? "the tree is ready to be re-entered" : "how conversation becomes form"}
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-black/58">
                interests stay in the canopy, identities gather near the trunk, quests live in the branches, and skills and actions settle below ground.
              </p>
            </CardHeader>
            <CardBody className="p-0">{treePreview}</CardBody>
          </Card>

          <div className="grid gap-6">
            <Card className="border border-black/5 bg-white/82 shadow-[0_20px_50px_rgba(32,24,18,0.05)]">
              <CardHeader className="flex-col items-start gap-3 border-b border-black/6 pb-5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-black/35">best way back in</p>
                <h2 className="font-[family-name:var(--font-instrument-serif)] text-[2rem] leading-none text-[#171411]">
                  {featuredEntry.title}
                </h2>
              </CardHeader>
              <CardBody className="gap-4">
                <div className="rounded-[24px] bg-[#f3f0e8] px-4 py-4 ring-1 ring-black/5">
                  <p className="text-sm leading-7 text-black/63">{featuredEntry.body}</p>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-black/35">{featuredEntry.meta}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {featuredCard ? (
                    <Button radius="full" className="bg-[#171411] text-white" onPress={() => onCardPress(featuredCard)}>
                      {featuredEntry.actionLabel}
                    </Button>
                  ) : null}
                  {secondaryEntry && secondaryCard ? (
                    <Button radius="full" variant="flat" className="bg-black/5 text-[#171411]" onPress={() => onCardPress(secondaryCard)}>
                      {secondaryEntry.actionLabel}
                    </Button>
                  ) : null}
                </div>
              </CardBody>
            </Card>

            {recentThreads.length > 0 ? (
              <Card className="border border-black/5 bg-white/82 shadow-[0_20px_50px_rgba(32,24,18,0.05)]">
                <CardHeader className="flex-col items-start gap-3 border-b border-black/6 pb-5">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-black/35">recent rooms</p>
                  <h2 className="font-[family-name:var(--font-instrument-serif)] text-[2rem] leading-none text-[#171411]">
                    where the last movement happened
                  </h2>
                </CardHeader>
                <CardBody className="gap-3">
                  {recentThreads.map((thread) => (
                    <button
                      key={thread.id}
                      type="button"
                      onClick={() => onOpenRecentThread(thread.id)}
                      className="rounded-[24px] bg-[#f3f0e8] px-4 py-4 text-left ring-1 ring-black/5 transition hover:bg-[#efe8da]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-[family-name:var(--font-instrument-serif)] text-[1.45rem] leading-none text-[#171411]">
                            {thread.title}
                          </p>
                          <p className="mt-2 text-sm leading-7 text-black/58">{thread.preview || thread.topic}</p>
                        </div>
                        {thread.isActive ? (
                          <Chip radius="full" className="border-none bg-[#171411] text-[10px] uppercase tracking-[0.18em] text-white">
                            active
                          </Chip>
                        ) : null}
                      </div>
                      <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-black/35">
                        {thread.nodeCount} {thread.nodeCount === 1 ? "node" : "nodes"} · {thread.touchedLabel}
                      </p>
                    </button>
                  ))}
                </CardBody>
              </Card>
            ) : null}

            <Card className="border border-black/5 bg-white/82 shadow-[0_20px_50px_rgba(32,24,18,0.05)]">
              <CardHeader className="flex-col items-start gap-3 border-b border-black/6 pb-5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-black/35">signals</p>
                <h2 className="font-[family-name:var(--font-instrument-serif)] text-[2rem] leading-none text-[#171411]">
                  {isReturning ? "what the tree is noticing now" : "what the tree can notice"}
                </h2>
              </CardHeader>
              <CardBody className="gap-4">
                {notes.map((note) => (
                  <div key={`${note.title}-${note.body}`} className="rounded-[24px] bg-[#f3f0e8] px-4 py-4 text-sm leading-7 text-black/63 ring-1 ring-black/5">
                    <p className="font-[family-name:var(--font-instrument-serif)] text-[1.35rem] leading-none text-[#171411]">
                      {note.title}
                    </p>
                    <p className="mt-3">{note.body}</p>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
        </div>

        <Card className="border border-black/5 bg-white/82 shadow-[0_20px_50px_rgba(32,24,18,0.05)]">
          <CardHeader className="flex-col items-start gap-3 border-b border-black/6 pb-5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-black/35">check-in deck</p>
            <h2 className="font-[family-name:var(--font-instrument-serif)] text-[2rem] leading-none text-[#171411]">
              {isReturning ? "pick a re-entry style" : "the first rooms you can open"}
            </h2>
          </CardHeader>
          <CardBody>
            <CheckInCardGrid cards={cards} onPress={onCardPress} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
