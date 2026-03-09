"use client";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { useEffect, useState } from "react";
import type { Thread } from "@/lib/identitree/types";

export function ThreadSettingsModal({
  thread,
  isOpen,
  onClose,
  onSave,
  onToggleArchive,
}: {
  thread: Thread | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: { title: string; topic: string }) => void;
  onToggleArchive: (archived: boolean) => void;
}) {
  const [title, setTitle] = useState(thread?.title ?? "");
  const [topic, setTopic] = useState(thread?.topic ?? "");

  useEffect(() => {
    setTitle(thread?.title ?? "");
    setTopic(thread?.topic ?? "");
  }, [thread]);

  return (
    <Modal isOpen={isOpen} onOpenChange={(next) => !next && onClose()} size="2xl">
      <ModalContent>
        <ModalHeader className="flex-col items-start gap-2 border-b border-black/6 pb-4">
          <p className="text-[11px] uppercase tracking-[0.22em] text-black/35">thread settings</p>
          <h2 className="font-[family-name:var(--font-instrument-serif)] text-4xl leading-none text-[#171411]">
            shape this room
          </h2>
        </ModalHeader>
        <ModalBody className="gap-4 py-6">
          <Input
            label="title"
            labelPlacement="outside"
            value={title}
            onValueChange={setTitle}
            placeholder="thread title"
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
          {thread && (
            <div className="rounded-[24px] bg-[#f3f0e8] px-4 py-4 text-sm leading-7 text-black/58 ring-1 ring-black/5">
              this room is currently linked to {thread.linkedNodeIds.length} {thread.linkedNodeIds.length === 1 ? "node" : "nodes"}.
            </div>
          )}
        </ModalBody>
        <ModalFooter className="justify-between border-t border-black/6">
          <Button
            radius="full"
            variant="light"
            className="text-black/60"
            onPress={() => onToggleArchive(!Boolean(thread?.archived))}
          >
            {thread?.archived ? "restore thread" : "archive thread"}
          </Button>
          <div className="flex gap-2">
            <Button variant="light" onPress={onClose}>
              close
            </Button>
            <Button
              radius="full"
              className="bg-[#171411] text-white"
              onPress={() => onSave({ title: title.trim() || thread?.title || "untitled thread", topic: topic.trim() || thread?.topic || "new reflection" })}
            >
              save thread
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
