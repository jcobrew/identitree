"use client";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import type { Thread, TreeEdge, TreeNode } from "@/lib/identitree/types";

export function NodeDetailSheet({
  node,
  editable,
  sourceThreads,
  bridgeEdges,
  mergeTargets,
  onOpenThread,
  onPatchNode,
  onReviewEdge,
}: {
  node: TreeNode;
  editable: boolean;
  sourceThreads: Thread[];
  bridgeEdges: TreeEdge[];
  mergeTargets: TreeNode[];
  onOpenThread: (threadId: string) => void;
  onPatchNode: (payload: { label?: string; insight?: string; archived?: boolean; mergeIntoId?: string }) => void;
  onReviewEdge: (edgeId: string, decision: "accept" | "reject") => void;
}) {
  const [label, setLabel] = useState(node.label);
  const [insight, setInsight] = useState(node.insight);
  const [mergeIntoId, setMergeIntoId] = useState<string>("");

  useEffect(() => {
    setLabel(node.label);
    setInsight(node.insight);
    setMergeIntoId("");
  }, [node.id, node.insight, node.label]);

  const unresolvedEdges = useMemo(
    () => bridgeEdges.filter((edge) => edge.status === "suggested"),
    [bridgeEdges],
  );

  return (
    <Card className="w-full max-w-[380px] border border-white/10 bg-[#111b24]/96 text-white shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <CardHeader className="flex-col items-start gap-3 border-b border-white/8 pb-5">
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/38">{node.type}</p>
        <h3 className="font-[family-name:var(--font-instrument-serif)] text-[2rem] leading-none text-white">
          {node.label}
        </h3>
        <p className="text-sm leading-7 text-white/60">{node.insight}</p>
      </CardHeader>
      <CardBody className="gap-5">
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/38">source threads</p>
          <div className="flex flex-wrap gap-2">
            {sourceThreads.map((thread) => (
              <Button
                key={thread.id}
                radius="full"
                variant="flat"
                className="bg-white/8 text-white"
                onPress={() => onOpenThread(thread.id)}
              >
                {thread.title}
              </Button>
            ))}
          </div>
        </div>

        <Divider className="bg-white/8" />

        {editable ? (
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/38">light edit</p>
            <Input
              label="label"
              labelPlacement="outside"
              value={label}
              onValueChange={setLabel}
              classNames={{ inputWrapper: "bg-white/5 border border-white/10 shadow-none", input: "text-white" }}
            />
            <Textarea
              label="meaning"
              labelPlacement="outside"
              minRows={3}
              value={insight}
              onValueChange={setInsight}
              classNames={{ inputWrapper: "bg-white/5 border border-white/10 shadow-none", input: "text-white" }}
            />
            <div className="flex flex-wrap gap-2">
              <Button radius="full" className="bg-white text-[#111b24]" onPress={() => onPatchNode({ label, insight })}>
                save changes
              </Button>
              <Button radius="full" variant="flat" className="bg-white/8 text-white" onPress={() => onPatchNode({ archived: !node.archived })}>
                {node.archived ? "restore node" : "archive node"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-[24px] bg-white/6 px-4 py-4 text-sm leading-7 text-white/60">
            this is a sample preview node. start your own reflection to edit and grow a personal tree.
          </div>
        )}

        {editable && mergeTargets.length > 0 && (
          <>
            <Divider className="bg-white/8" />
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/38">merge duplicate</p>
              <Select
                selectedKeys={mergeIntoId ? [mergeIntoId] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0];
                  setMergeIntoId(typeof value === "string" ? value : "");
                }}
                placeholder="choose another node of the same type"
                classNames={{ trigger: "bg-white/5 border border-white/10 shadow-none", value: "text-white" }}
              >
                {mergeTargets.map((target) => (
                  <SelectItem key={target.id}>{target.label}</SelectItem>
                ))}
              </Select>
              <Button
                radius="full"
                variant="flat"
                className="bg-white/8 text-white"
                isDisabled={!mergeIntoId}
                onPress={() => onPatchNode({ mergeIntoId })}
              >
                merge into selected node
              </Button>
            </div>
          </>
        )}

        {bridgeEdges.length > 0 && (
          <>
            <Divider className="bg-white/8" />
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/38">cross-thread bridges</p>
              {bridgeEdges.map((edge) => (
                <div key={edge.id} className="rounded-[24px] bg-white/6 px-4 py-4">
                  <p className="text-sm leading-7 text-white/70">{edge.reason}</p>
                  {edge.status === "suggested" ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" radius="full" className="bg-white text-[#111b24]" onPress={() => onReviewEdge(edge.id, "accept")}>
                        accept bridge
                      </Button>
                      <Button size="sm" radius="full" variant="flat" className="bg-white/10 text-white" onPress={() => onReviewEdge(edge.id, "reject")}>
                        reject
                      </Button>
                    </div>
                  ) : (
                    <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-white/40">{edge.status}</p>
                  )}
                </div>
              ))}
              {unresolvedEdges.length === 0 && <p className="text-sm leading-7 text-white/55">no pending bridge reviews here.</p>}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
