"use client";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Textarea,
} from "@heroui/react";
import type { ArchitectObservation, Thread, TreeNode } from "@/lib/identitree/types";

export function ThreadWorkspace({
  thread,
  suggestions,
  draft,
  isBusy,
  relatedNodes,
  observations,
  onSuggestion,
  onDraftChange,
  onSend,
  onOpenTree,
  onFocusNode,
  onOpenThreadSettings,
}: {
  thread: Thread;
  suggestions: string[];
  draft: string;
  isBusy: boolean;
  relatedNodes: TreeNode[];
  observations: ArchitectObservation[];
  onSuggestion: (value: string) => void;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onOpenTree: () => void;
  onFocusNode: (nodeId: string) => void;
  onOpenThreadSettings: () => void;
}) {
  return (
    <div className="grid h-[calc(100vh-88px)] gap-6 overflow-hidden bg-[#f6f3ed] px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1.25fr)_360px] lg:px-8">
      <Card className="flex min-h-0 flex-col border border-black/5 bg-white/86 shadow-[0_20px_50px_rgba(32,24,18,0.05)]">
        <CardHeader className="flex-col items-start gap-3 border-b border-black/6 pb-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-black/35">active thread</p>
          <div className="flex w-full flex-wrap items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-[family-name:var(--font-instrument-serif)] text-[2.4rem] leading-none text-[#171411]">
                {thread.title}
              </h2>
              <Chip radius="full" className="border-none bg-black/5 text-[10px] uppercase tracking-[0.18em] text-black/45">
                {thread.kind}
              </Chip>
              <Chip radius="full" className="border-none bg-[#efe8da] text-[10px] uppercase tracking-[0.18em] text-[#5a4a33]">
                {thread.linkedNodeIds.length} {thread.linkedNodeIds.length === 1 ? "node" : "nodes"}
              </Chip>
            </div>
            <Button radius="full" variant="light" className="text-[#171411]" onPress={onOpenThreadSettings}>
              thread settings
            </Button>
          </div>
          <p className="max-w-3xl text-sm leading-7 text-black/58">{thread.topic}</p>
        </CardHeader>

        <CardBody className="flex min-h-0 flex-col gap-4 overflow-hidden">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            {thread.messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "mirror" ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[85%] ${message.role === "mirror" ? "mr-12" : "ml-12"}`}>
                  <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-black/35">
                    {message.role === "mirror" ? "the mirror" : "you"}
                  </p>
                  <div
                    className={`rounded-[28px] px-5 py-4 text-[15px] leading-8 ${
                      message.role === "mirror"
                        ? "bg-[#f3f0e8] text-black/72 ring-1 ring-black/5"
                        : "bg-[#171411] text-white"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4 border-t border-black/6 pt-4">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  radius="full"
                  variant="flat"
                  className="bg-black/5 text-[#171411]"
                  onPress={() => onSuggestion(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
            <Textarea
              value={draft}
              onValueChange={onDraftChange}
              minRows={4}
              maxRows={8}
              placeholder="drop the next honest sentence here"
              classNames={{
                inputWrapper: "bg-[#fbfaf6] border border-black/8 shadow-none",
                input: "text-[15px] leading-8 text-[#171411]",
              }}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button radius="full" variant="light" className="text-[#171411]" onPress={onOpenTree}>
                open tree
              </Button>
              <Button radius="full" className="bg-[#171411] text-white" isLoading={isBusy} onPress={onSend}>
                send to the mirror
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid min-h-0 gap-6 overflow-y-auto pb-4">
        <Card className="border border-black/5 bg-white/86 shadow-[0_20px_50px_rgba(32,24,18,0.05)]">
          <CardHeader className="flex-col items-start gap-2 border-b border-black/6 pb-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-black/35">thread summary</p>
            <h3 className="font-[family-name:var(--font-instrument-serif)] text-[2rem] leading-none text-[#171411]">
              what this room is feeding
            </h3>
          </CardHeader>
          <CardBody className="gap-4">
            <p className="text-sm leading-7 text-black/58">
              linked nodes are the parts of the tree this thread has already started shaping.
            </p>
            <div className="flex flex-wrap gap-2">
              {relatedNodes.length > 0 ? (
                relatedNodes.map((node) => (
                  <Button
                    key={node.id}
                    radius="full"
                    variant="flat"
                    className="bg-[#f3f0e8] text-[#171411]"
                    onPress={() => onFocusNode(node.id)}
                  >
                    {node.type}: {node.label}
                  </Button>
                ))
              ) : (
                <Chip radius="full" className="border-none bg-black/5 text-black/45">
                  no nodes yet
                </Chip>
              )}
            </div>
          </CardBody>
        </Card>

        <Card className="border border-black/5 bg-white/86 shadow-[0_20px_50px_rgba(32,24,18,0.05)]">
          <CardHeader className="flex-col items-start gap-2 border-b border-black/6 pb-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-black/35">architect notes</p>
            <h3 className="font-[family-name:var(--font-instrument-serif)] text-[2rem] leading-none text-[#171411]">
              what the background layer sees
            </h3>
          </CardHeader>
          <CardBody className="gap-4">
            {observations.length > 0 ? (
              observations.map((observation, index) => (
                <div key={observation.id} className="space-y-3">
                  <div className="rounded-[24px] bg-[#f3f0e8] px-4 py-4 ring-1 ring-black/5">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-black/35">{observation.kind}</p>
                    <p className="mt-2 font-[family-name:var(--font-instrument-serif)] text-[1.45rem] leading-none text-[#171411]">
                      {observation.title}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-black/58">{observation.body}</p>
                  </div>
                  {index < observations.length - 1 && <Divider className="bg-black/6" />}
                </div>
              ))
            ) : (
              <p className="text-sm leading-7 text-black/58">the architect will start surfacing bridges after a few honest turns.</p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
