"use client";

import { Button, Chip } from "@heroui/react";

export function WorkspaceHeader({
  view,
  title,
  subtitle,
  onChangeView,
  onOpenThreadSwitcher,
  onNewThread,
  onGoHome,
}: {
  view: "thread" | "tree";
  title: string;
  subtitle: string;
  onChangeView: (view: "thread" | "tree") => void;
  onOpenThreadSwitcher: () => void;
  onNewThread: () => void;
  onGoHome: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0e1720]/88 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <Button radius="full" variant="light" className="text-white/72" onPress={onGoHome}>
              identitree
            </Button>
            <Chip radius="full" className="border border-white/10 bg-white/5 text-[10px] uppercase tracking-[0.18em] text-white/72">
              mirror + architect
            </Chip>
          </div>
          <h1 className="mt-2 truncate font-[family-name:var(--font-instrument-serif)] text-3xl leading-none text-white sm:text-[2.25rem]">
            {title}
          </h1>
          <p className="mt-1 text-sm leading-6 text-white/58">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
            <Button
              radius="full"
              size="sm"
              className={view === "thread" ? "bg-white text-[#0e1720]" : "bg-transparent text-white/72"}
              onPress={() => onChangeView("thread")}
            >
              reflection
            </Button>
            <Button
              radius="full"
              size="sm"
              className={view === "tree" ? "bg-white text-[#0e1720]" : "bg-transparent text-white/72"}
              onPress={() => onChangeView("tree")}
            >
              tree
            </Button>
          </div>
          <Button radius="full" variant="flat" className="bg-white/10 text-white" onPress={onOpenThreadSwitcher}>
            threads
          </Button>
          <Button radius="full" className="bg-[#f3ede1] text-[#171411]" onPress={onNewThread}>
            new thread
          </Button>
        </div>
      </div>
    </header>
  );
}
