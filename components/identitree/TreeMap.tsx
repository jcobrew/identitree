"use client";

import { motion } from "framer-motion";
import {
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { GROUND_Y, SVG_HEIGHT, SVG_WIDTH, buildTreePositions, structuralPathForNodes } from "@/lib/identitree/layout";
import { MAX_TREE_ZOOM, MIN_TREE_ZOOM } from "@/lib/identitree/seed";
import type { Thread, TreeEdge, TreeNode, TreeCamera } from "@/lib/identitree/types";

const nodeStyle: Record<TreeNode["type"], { fill: string; stroke: string; text: string }> = {
  interest: { fill: "#d6e3d8", stroke: "#89a38d", text: "#213327" },
  identity: { fill: "#e6d7bf", stroke: "#d1b285", text: "#3a2e1d" },
  self: { fill: "#f3ede0", stroke: "#f5f5f5", text: "#101820" },
  quest: { fill: "#d8dde5", stroke: "#8ea1b3", text: "#1b2732" },
  skill: { fill: "#d9ddd6", stroke: "#8b9888", text: "#1f261e" },
  action: { fill: "#d8d0c6", stroke: "#988773", text: "#2c241b" },
};

const canopyPaths = [
  "M 180 260 C 300 120, 520 90, 700 126 C 870 92, 1088 120, 1210 256",
  "M 248 304 C 390 220, 552 208, 700 232 C 852 208, 1012 220, 1158 304",
  "M 314 350 C 446 298, 574 292, 700 312 C 826 292, 954 298, 1086 350",
];

const trunkPaths = [
  "M 664 188 C 648 282, 650 376, 664 470 C 672 530, 682 582, 692 640",
  "M 736 188 C 752 282, 750 376, 736 470 C 728 530, 718 582, 708 640",
  "M 700 188 C 700 280, 700 374, 700 470 C 700 534, 700 586, 700 640",
];

const soilLines = [560, 618, 676, 734].map(
  (y) => `M 88 ${y} C 260 ${y + 10}, 438 ${y + 10}, 612 ${y} C 790 ${y - 10}, 972 ${y - 10}, 1312 ${y}`,
);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const traceNodeIds = (selectedNodeId: string | null, edges: TreeEdge[]) => {
  if (!selectedNodeId) return new Set<string>();
  const activeEdges = edges.filter((edge) => edge.status !== "rejected");
  const visited = new Set<string>([selectedNodeId]);
  const queue = [selectedNodeId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;
    activeEdges.forEach((edge) => {
      if (edge.fromId === current && !visited.has(edge.toId)) {
        visited.add(edge.toId);
        queue.push(edge.toId);
      }
      if (edge.toId === current && !visited.has(edge.fromId)) {
        visited.add(edge.fromId);
        queue.push(edge.fromId);
      }
    });
  }

  return visited;
};

export function TreeMap({
  nodes,
  edges,
  threads,
  selectedNodeId,
  camera,
  interactive = false,
  compact = false,
  traceConnectedSelection = true,
  highlightNodeIds,
  highlightEdgeIds,
  selectableNodeIds,
  onCameraChange,
  onSelectNode,
}: {
  nodes: TreeNode[];
  edges: TreeEdge[];
  threads: Thread[];
  selectedNodeId: string | null;
  camera: TreeCamera;
  interactive?: boolean;
  compact?: boolean;
  traceConnectedSelection?: boolean;
  highlightNodeIds?: string[];
  highlightEdgeIds?: string[];
  selectableNodeIds?: string[];
  onCameraChange?: (camera: TreeCamera) => void;
  onSelectNode?: (nodeId: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dragOrigin, setDragOrigin] = useState<{ x: number; y: number; cameraX: number; cameraY: number } | null>(null);

  const positions = useMemo(() => buildTreePositions(nodes), [nodes]);
  const threadColorMap = useMemo(() => Object.fromEntries(threads.map((thread) => [thread.id, thread.color] as const)), [threads]);
  const tracedNodeIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    return traceConnectedSelection ? traceNodeIds(selectedNodeId, edges) : new Set<string>([selectedNodeId]);
  }, [edges, selectedNodeId, traceConnectedSelection]);
  const highlightedNodeIds = useMemo(() => new Set(highlightNodeIds ?? []), [highlightNodeIds]);
  const highlightedEdgeIds = useMemo(() => new Set(highlightEdgeIds ?? []), [highlightEdgeIds]);
  const selectableIds = useMemo(() => new Set(selectableNodeIds ?? []), [selectableNodeIds]);
  const visibleEdges = useMemo(() => edges.filter((edge) => edge.status !== "rejected"), [edges]);

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (!interactive || !onCameraChange || !containerRef.current) return;
    event.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = SVG_WIDTH / rect.width;
    const scaleY = SVG_HEIGHT / rect.height;
    const pointerX = (event.clientX - rect.left) * scaleX;
    const pointerY = (event.clientY - rect.top) * scaleY;
    const worldX = (pointerX - camera.x) / camera.zoom;
    const worldY = (pointerY - camera.y) / camera.zoom;
    const nextZoom = clamp(camera.zoom * (event.deltaY > 0 ? 0.92 : 1.08), MIN_TREE_ZOOM, MAX_TREE_ZOOM);
    onCameraChange({
      zoom: nextZoom,
      x: pointerX - worldX * nextZoom,
      y: pointerY - worldY * nextZoom,
    });
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive || !onCameraChange) return;
    const target = event.target as HTMLElement;
    if (target.closest("[data-node='true']")) return;
    setDragOrigin({ x: event.clientX, y: event.clientY, cameraX: camera.x, cameraY: camera.y });
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive || !onCameraChange || !dragOrigin || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = SVG_WIDTH / rect.width;
    const scaleY = SVG_HEIGHT / rect.height;
    onCameraChange({
      ...camera,
      x: dragOrigin.cameraX + (event.clientX - dragOrigin.x) * scaleX,
      y: dragOrigin.cameraY + (event.clientY - dragOrigin.y) * scaleY,
    });
  };

  const handlePointerUp = () => {
    setDragOrigin(null);
  };

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden ${compact ? "min-h-[380px]" : "min-h-[560px]"}`}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="h-full w-full" role="img" aria-label="identitree map">
        <defs>
          <linearGradient id="tree-bg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#101923" />
            <stop offset="100%" stopColor="#0b1219" />
          </linearGradient>
          <linearGradient id="ground-fade" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#tree-bg)" />
        <rect x="0" y={GROUND_Y} width={SVG_WIDTH} height={SVG_HEIGHT - GROUND_Y} fill="url(#ground-fade)" opacity="0.28" />

        <g opacity={0.22}>
          {soilLines.map((path) => (
            <path key={path} d={path} fill="none" stroke="#d9d1c3" strokeWidth="1" strokeLinecap="round" />
          ))}
          {canopyPaths.map((path, index) => (
            <path key={path} d={path} fill="none" stroke="#aab5c1" strokeWidth={index === 0 ? 3 : 1.4} strokeLinecap="round" />
          ))}
          {trunkPaths.map((path, index) => (
            <path key={path} d={path} fill="none" stroke="#d5d7dc" strokeWidth={index === 2 ? 5.6 : 9.5} strokeLinecap="round" />
          ))}
        </g>

        <g transform={`translate(${camera.x} ${camera.y}) scale(${camera.zoom})`}>
          {visibleEdges.map((edge) => {
            const fromNode = nodes.find((node) => node.id === edge.fromId);
            const toNode = nodes.find((node) => node.id === edge.toId);
            if (!fromNode || !toNode) return null;
            const fromPoint = positions.get(fromNode.id);
            const toPoint = positions.get(toNode.id);
            if (!fromPoint || !toPoint) return null;
            const color = edge.crossThread
              ? "#67c3ff"
              : threadColorMap[fromNode.firstSourceThreadId] ?? threadColorMap[toNode.firstSourceThreadId] ?? "#b7c1cd";
            const traced = tracedNodeIds.has(edge.fromId) && tracedNodeIds.has(edge.toId);
            const highlighted = highlightedEdgeIds.size > 0 && highlightedEdgeIds.has(edge.id);
            const dimmed = highlightedEdgeIds.size > 0 && !highlighted;
            const path = structuralPathForNodes({ from: fromPoint, to: toPoint, fromType: fromNode.type, toType: toNode.type });

            return (
              <g key={edge.id} opacity={highlighted ? 1 : traced ? 0.94 : dimmed ? 0.12 : edge.crossThread ? 0.45 : 0.26}>
                <path
                  d={path}
                  fill="none"
                  stroke={color}
                  strokeWidth={highlighted ? (edge.crossThread ? 2.2 : 1.9) : edge.crossThread ? 1.5 : 1.1}
                  strokeDasharray={edge.crossThread ? "8 10" : undefined}
                  strokeLinecap="round"
                />
                {(traced || highlighted) && (
                  <motion.path
                    d={path}
                    fill="none"
                    stroke={color}
                    strokeWidth={highlighted ? (edge.crossThread ? 3.1 : 2.8) : edge.crossThread ? 2.6 : 2.1}
                    strokeLinecap="round"
                    strokeDasharray="12 24"
                    animate={{ strokeDashoffset: [0, -160], opacity: [0.3, 0.95, 0.3] }}
                    transition={{ duration: 4.5, ease: "linear", repeat: Infinity }}
                  />
                )}
              </g>
            );
          })}

          {nodes.filter((node) => !node.archived).map((node) => {
            const point = positions.get(node.id);
            if (!point) return null;
            const style = nodeStyle[node.type];
            const traced = tracedNodeIds.has(node.id);
            const selected = selectedNodeId === node.id;
            const highlighted = highlightedNodeIds.size > 0 && highlightedNodeIds.has(node.id);
            const dimmed = highlightedNodeIds.size > 0 && !highlighted;
            const selectable = selectableIds.size === 0 || selectableIds.has(node.id);
            const accent = node.sourceThreadIds.length > 1 ? "#67c3ff" : threadColorMap[node.firstSourceThreadId] ?? style.stroke;
            const r = node.type === "self" ? 24 : 16;

            return (
              <g
                key={node.id}
                transform={`translate(${point.x} ${point.y})`}
                data-node="true"
                className={onSelectNode && selectable ? "cursor-pointer" : undefined}
                opacity={dimmed ? 0.34 : 1}
                onClick={() => {
                  if (!selectable) return;
                  onSelectNode?.(node.id);
                }}
              >
                <circle
                  r={r + (selected ? 7 : highlighted ? 5 : traced ? 4 : 0)}
                  fill="none"
                  stroke={accent}
                  strokeWidth={selected || highlighted ? 2.4 : 1.2}
                  opacity={selected ? 0.85 : highlighted ? 0.58 : traced ? 0.45 : 0}
                />
                <circle r={r} fill={style.fill} stroke={accent} strokeWidth={selected || highlighted ? 2.4 : 1.5} />
                <text y={1} textAnchor="middle" dominantBaseline="middle" fontSize={9.5} letterSpacing="0.12em" fontWeight={700} fill={style.text}>
                  {node.type === "self" ? "self" : node.type.slice(0, 2).toUpperCase()}
                </text>
                <text
                  y={r + 18}
                  textAnchor="middle"
                  fontSize={compact ? 11 : 12}
                  fill="#eef2f5"
                  opacity={highlighted || traced || selected || compact ? 0.94 : 0.68}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
