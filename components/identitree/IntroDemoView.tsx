"use client";

import { Button, Card, CardBody, CardHeader, Chip, Divider } from "@heroui/react";
import { useMemo } from "react";
import { TreeMap } from "@/components/identitree/TreeMap";
import type { DemoChapter, Thread, TreeEdge, TreeNode } from "@/lib/identitree/types";

type IntroDemoViewProps = {
  chapter: DemoChapter;
  chapterIndex: number;
  chapterCount: number;
  nodes: TreeNode[];
  edges: TreeEdge[];
  threads: Thread[];
  selectedNode: TreeNode | null;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  onSelectNode: (nodeId: string) => void;
  onStartFresh: () => void;
  onStartBuilderStarter: () => void;
};

export function IntroDemoView({
  chapter,
  chapterIndex,
  chapterCount,
  nodes,
  edges,
  threads,
  selectedNode,
  onBack,
  onNext,
  onSkip,
  onSelectNode,
  onStartFresh,
  onStartBuilderStarter,
}: IntroDemoViewProps) {
  const isLastChapter = chapterIndex === chapterCount - 1;
  const selectedNodeSourceThreads = useMemo(
    () => (selectedNode ? threads.filter((thread) => selectedNode.sourceThreadIds.includes(thread.id)) : []),
    [selectedNode, threads],
  );

  return (
    <div className="min-h-screen bg-[#f6f3ed] px-4 py-5 text-[#171411] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-[28px] bg-white/84 px-6 py-6 shadow-[0_20px_50px_rgba(32,24,18,0.05)] ring-1 ring-black/5 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-black/35">make something tribute</p>
            <h1 className="font-[family-name:var(--font-instrument-serif)] text-5xl leading-[0.94] tracking-[-0.03em] sm:text-6xl">
              becoming a builder through a real build loop
            </h1>
            <p className="max-w-2xl text-base leading-8 text-black/62 sm:text-lg">
              this intro is a tribute to make something, the framework that made identitree possible. it shows how setup, chat-building, fixing, and shipping can grow one builder identity over time.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button radius="full" variant="flat" className="bg-black/5 text-[#171411]" onPress={onSkip}>
              skip to my tree
            </Button>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <Card className="border border-black/5 bg-white/84 shadow-[0_20px_50px_rgba(32,24,18,0.05)]">
            <CardHeader className="flex-col items-start gap-4 border-b border-black/6 pb-5">
              <div className="flex w-full items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.22em] text-black/35">
                  chapter {chapterIndex + 1} of {chapterCount}
                </p>
                <Chip radius="full" className="border-none bg-black/5 text-[10px] uppercase tracking-[0.18em] text-black/45">
                  guided story
                </Chip>
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: chapterCount }, (_, index) => (
                  <span
                    key={`chapter-dot-${index}`}
                    className={`h-2.5 rounded-full transition-all ${index === chapterIndex ? "w-10 bg-[#171411]" : "w-2.5 bg-black/10"}`}
                  />
                ))}
              </div>
              <h2 className="font-[family-name:var(--font-instrument-serif)] text-[2.4rem] leading-none text-[#171411] sm:text-[2.8rem]">
                {chapter.title}
              </h2>
            </CardHeader>
            <CardBody className="gap-4">
              <div className="rounded-[24px] bg-[#f3f0e8] px-4 py-4 ring-1 ring-black/5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-black/35">story</p>
                <p className="mt-3 text-sm leading-7 text-black/65">{chapter.body}</p>
              </div>

              <div className="rounded-[24px] bg-[#f8f5ee] px-4 py-4 ring-1 ring-black/5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-black/35">what changed in the tree</p>
                <p className="mt-3 text-sm leading-7 text-black/63">{chapter.treeNote}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[24px] bg-[#f8f5ee] px-4 py-4 ring-1 ring-black/5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-black/35">skill growing here</p>
                  <p className="mt-2 font-[family-name:var(--font-instrument-serif)] text-[1.45rem] leading-none text-[#171411]">
                    {chapter.skillLabel}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-black/63">{chapter.skillNote}</p>
                </div>
                <div className="rounded-[24px] bg-[#f8f5ee] px-4 py-4 ring-1 ring-black/5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-black/35">quest getting finished</p>
                  <p className="mt-2 font-[family-name:var(--font-instrument-serif)] text-[1.45rem] leading-none text-[#171411]">
                    {chapter.questLabel}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-black/63">{chapter.questNote}</p>
                </div>
              </div>

              {isLastChapter ? (
                <div className="rounded-[28px] bg-[#171411] px-5 py-5 text-white">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/48">your handoff</p>
                  <p className="mt-3 font-[family-name:var(--font-instrument-serif)] text-[1.7rem] leading-none">
                    make something built the path. now it becomes your tree.
                  </p>
                  <p className="mt-3 text-sm leading-7 text-white/72">
                    you can begin clean, or you can carry a builder scaffold into your own identitree and reshape it from lived proof.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button radius="full" className="bg-white text-[#171411]" onPress={onStartFresh}>
                      start fresh
                    </Button>
                    <Button radius="full" variant="flat" className="bg-white/10 text-white" onPress={onStartBuilderStarter}>
                      start with builder starter tree
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <Button radius="full" variant="light" className="text-[#171411]" isDisabled={chapterIndex === 0} onPress={onBack}>
                  back
                </Button>
                {!isLastChapter ? (
                  <Button radius="full" className="bg-[#171411] text-white" onPress={onNext}>
                    next
                  </Button>
                ) : null}
              </div>
            </CardBody>
          </Card>

          <Card className="overflow-hidden border border-black/5 bg-white/84 shadow-[0_20px_50px_rgba(32,24,18,0.05)]">
            <CardHeader className="flex-col items-start gap-3 border-b border-black/6 pb-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-black/35">interactive tree</p>
              <h2 className="font-[family-name:var(--font-instrument-serif)] text-[2rem] leading-none text-[#171411]">
                watch the builder path light up
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-black/58">
                the highlighted nodes belong to this chapter. tap them if you want to inspect the exact skill, quest, or action that is moving.
              </p>
            </CardHeader>
            <CardBody className="gap-4 p-0">
              <div className="h-[560px] bg-[#0b1219]">
                <TreeMap
                  nodes={nodes}
                  edges={edges}
                  threads={threads}
                  selectedNodeId={selectedNode?.id ?? chapter.focusNodeIds[0] ?? null}
                  camera={chapter.camera}
                  highlightNodeIds={chapter.focusNodeIds}
                  highlightEdgeIds={chapter.focusEdgeIds}
                  selectableNodeIds={chapter.focusNodeIds}
                  traceConnectedSelection={false}
                  onSelectNode={onSelectNode}
                />
              </div>

              <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_240px]">
                <div className="rounded-[24px] bg-[#f3f0e8] px-4 py-4 ring-1 ring-black/5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-black/35">selected node</p>
                  {selectedNode ? (
                    <>
                      <p className="mt-2 font-[family-name:var(--font-instrument-serif)] text-[1.7rem] leading-none text-[#171411]">
                        {selectedNode.label}
                      </p>
                      <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-black/35">{selectedNode.type}</p>
                      <p className="mt-3 text-sm leading-7 text-black/63">{selectedNode.insight}</p>
                    </>
                  ) : (
                    <p className="mt-3 text-sm leading-7 text-black/58">the current chapter is guiding the selection. tap one of the highlighted nodes to read its part in the path.</p>
                  )}
                </div>

                <div className="rounded-[24px] bg-[#f8f5ee] px-4 py-4 ring-1 ring-black/5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-black/35">fed here by</p>
                  {selectedNodeSourceThreads.length > 0 ? (
                    <div className="mt-3 space-y-3">
                      {selectedNodeSourceThreads.slice(0, 3).map((thread, index) => (
                        <div key={thread.id}>
                          <p className="font-[family-name:var(--font-instrument-serif)] text-[1.2rem] leading-none text-[#171411]">
                            {thread.title}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-black/58">{thread.preview}</p>
                          {index < selectedNodeSourceThreads.length - 1 ? <Divider className="mt-3 bg-black/6" /> : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm leading-7 text-black/58">this chapter is focused on the path itself more than one source room.</p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
