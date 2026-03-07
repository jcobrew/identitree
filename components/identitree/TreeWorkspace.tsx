"use client";

import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { TreeMap } from "@/components/identitree/TreeMap";
import { NodeDetailSheet } from "@/components/identitree/NodeDetailSheet";
import type { Thread, TreeEdge, TreeNode, TreeCamera } from "@/lib/identitree/types";

export function TreeWorkspace({
  nodes,
  edges,
  threads,
  camera,
  editable,
  selectedNode,
  selectedNodeSourceThreads,
  selectedNodeBridgeEdges,
  mergeTargets,
  onCameraChange,
  onSelectNode,
  onOpenThread,
  onPatchNode,
  onReviewEdge,
}: {
  nodes: TreeNode[];
  edges: TreeEdge[];
  threads: Thread[];
  camera: TreeCamera;
  editable: boolean;
  selectedNode: TreeNode | null;
  selectedNodeSourceThreads: Thread[];
  selectedNodeBridgeEdges: TreeEdge[];
  mergeTargets: TreeNode[];
  onCameraChange: (camera: TreeCamera) => void;
  onSelectNode: (nodeId: string) => void;
  onOpenThread: (threadId: string) => void;
  onPatchNode: (payload: { label?: string; insight?: string; archived?: boolean; mergeIntoId?: string }) => void;
  onReviewEdge: (edgeId: string, decision: "accept" | "reject") => void;
}) {
  return (
    <div className="relative h-[calc(100vh-88px)] overflow-hidden bg-[#0b1219]">
      <div className="absolute left-4 top-4 z-20 max-w-[320px] sm:left-6 sm:top-6">
        <Card className="border border-white/8 bg-[#101923]/84 text-white shadow-[0_24px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl">
          <CardHeader className="flex-col items-start gap-2 pb-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/38">map room</p>
            <h2 className="font-[family-name:var(--font-instrument-serif)] text-[2rem] leading-none text-white">
              one shared tree across every thread
            </h2>
          </CardHeader>
          <CardBody className="gap-4 pt-0 text-sm leading-7 text-white/60">
            <p>pan by dragging the open canvas. zoom with the wheel. tap a node to see which threads are feeding it.</p>
            <div className="flex flex-wrap gap-2">
              <Button radius="full" size="sm" className="bg-white text-[#0b1219]" onPress={() => onCameraChange({ x: 0, y: 0, zoom: 1 })}>
                reset view
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      <TreeMap
        nodes={nodes}
        edges={edges}
        threads={threads}
        selectedNodeId={selectedNode?.id ?? null}
        camera={camera}
        interactive
        onCameraChange={onCameraChange}
        onSelectNode={onSelectNode}
      />

      {selectedNode && (
        <div className="absolute bottom-4 right-4 z-20 w-[min(100%-2rem,380px)] sm:bottom-6 sm:right-6">
          <NodeDetailSheet
            node={selectedNode}
            editable={editable}
            sourceThreads={selectedNodeSourceThreads}
            bridgeEdges={selectedNodeBridgeEdges}
            mergeTargets={mergeTargets}
            onOpenThread={onOpenThread}
            onPatchNode={onPatchNode}
            onReviewEdge={onReviewEdge}
          />
        </div>
      )}
    </div>
  );
}
