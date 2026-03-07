"use client";

import {
  Button,
  Card,
  CardBody,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { useMemo, useState } from "react";
import type { Thread, ThreadKind } from "@/lib/identitree/types";

const kindLabels: ThreadKind[] = ["exploration", "reflection", "quest", "domain"];

export function ThreadSwitcherModal({
  isOpen,
  threads,
  activeThreadId,
  onClose,
  onSelectThread,
  onCreateThread,
}: {
  isOpen: boolean;
  threads: Thread[];
  activeThreadId: string | null;
  onClose: () => void;
  onSelectThread: (threadId: string) => void;
  onCreateThread: (payload: { title: string; topic: string; kind: ThreadKind }) => void;
}) {
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [kind, setKind] = useState<ThreadKind>("exploration");

  const sortedThreads = useMemo(
    () => [...threads].sort((a, b) => Number(a.archived) - Number(b.archived) || b.updatedAt.localeCompare(a.updatedAt)),
    [threads],
  );

  return (
    <Modal isOpen={isOpen} onOpenChange={(next) => !next && onClose()} size="4xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex-col items-start gap-2 border-b border-black/6 pb-4">
          <p className="text-[11px] uppercase tracking-[0.22em] text-black/35">thread switcher</p>
          <h2 className="font-[family-name:var(--font-instrument-serif)] text-4xl leading-none text-[#171411]">
            switch rooms without losing the tree
          </h2>
        </ModalHeader>
        <ModalBody className="grid gap-6 py-6 lg:grid-cols-[minmax(0,1.15fr)_320px]">
          <div className="space-y-3">
            {sortedThreads.map((thread) => (
              <Card
                key={thread.id}
                isPressable
                onPress={() => onSelectThread(thread.id)}
                className={`border border-black/6 bg-[#faf7f1] text-left shadow-none ${thread.id === activeThreadId ? "ring-2 ring-[#171411]/10" : ""}`}
              >
                <CardBody className="gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-black/35">{thread.kind}</p>
                      <h3 className="mt-2 font-[family-name:var(--font-instrument-serif)] text-2xl leading-none text-[#171411]">
                        {thread.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-black/58">{thread.topic}</p>
                    </div>
                    <Chip radius="full" className="border-none bg-black/5 text-[10px] uppercase tracking-[0.18em] text-black/45">
                      {thread.archived ? "archived" : thread.linkedNodeIds.length + " nodes"}
                    </Chip>
                  </div>
                  <p className="text-sm leading-7 text-black/48">{thread.preview || "no reflection yet"}</p>
                </CardBody>
              </Card>
            ))}
          </div>

          <Card className="border border-black/6 bg-[#faf7f1] shadow-none">
            <CardBody className="gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-black/35">new thread</p>
                <h3 className="mt-2 font-[family-name:var(--font-instrument-serif)] text-3xl leading-none text-[#171411]">
                  open another room
                </h3>
              </div>
              <Input
                label="title"
                labelPlacement="outside"
                value={title}
                onValueChange={setTitle}
                placeholder="for example: user interviews"
                classNames={{ inputWrapper: "bg-white border border-black/8 shadow-none" }}
              />
              <Input
                label="topic"
                labelPlacement="outside"
                value={topic}
                onValueChange={setTopic}
                placeholder="what this thread is really about"
                classNames={{ inputWrapper: "bg-white border border-black/8 shadow-none" }}
              />
              <div className="flex flex-wrap gap-2">
                {kindLabels.map((option) => (
                  <Button
                    key={option}
                    radius="full"
                    variant={kind === option ? "solid" : "flat"}
                    className={kind === option ? "bg-[#171411] text-white" : "bg-black/5 text-[#171411]"}
                    onPress={() => setKind(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              <Button
                className="bg-[#171411] text-white"
                radius="full"
                onPress={() => {
                  onCreateThread({
                    title: title.trim() || "untitled thread",
                    topic: topic.trim() || title.trim() || "new reflection",
                    kind,
                  });
                  setTitle("");
                  setTopic("");
                }}
              >
                create thread
              </Button>
            </CardBody>
          </Card>
        </ModalBody>
        <ModalFooter className="border-t border-black/6">
          <Button variant="light" onPress={onClose}>
            close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
