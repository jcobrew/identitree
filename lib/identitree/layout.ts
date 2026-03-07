import type { TreeNode } from "@/lib/identitree/types";

export type Point = { x: number; y: number };

export const SVG_WIDTH = 1400;
export const SVG_HEIGHT = 860;
export const GROUND_Y = 470;

const CENTER_X = SVG_WIDTH / 2;
const SELF_Y = 360;

const distributeArc = ({
  count,
  radiusX,
  radiusY,
  start,
  end,
  centerY,
}: {
  count: number;
  radiusX: number;
  radiusY: number;
  start: number;
  end: number;
  centerY: number;
}) => {
  if (count <= 0) return [] as Point[];
  return Array.from({ length: count }, (_, index) => {
    const progress = count === 1 ? 0.5 : index / (count - 1);
    const angle = start + (end - start) * progress;
    return {
      x: CENTER_X + Math.cos(angle) * radiusX,
      y: centerY + Math.sin(angle) * radiusY,
    };
  });
};

const distributeBand = ({
  count,
  y,
  width,
  sway = 0,
}: {
  count: number;
  y: number;
  width: number;
  sway?: number;
}) => {
  if (count <= 0) return [] as Point[];
  return Array.from({ length: count }, (_, index) => {
    const progress = count === 1 ? 0.5 : index / (count - 1);
    const offset = (progress - 0.5) * width;
    return {
      x: CENTER_X + offset,
      y: y + Math.sin(progress * Math.PI) * sway,
    };
  });
};

export const buildTreePositions = (nodes: TreeNode[]) => {
  const activeNodes = nodes.filter((node) => !node.archived);
  const selfNode = activeNodes.find((node) => node.type === "self");
  const interestNodes = activeNodes.filter((node) => node.type === "interest").sort((a, b) => a.label.localeCompare(b.label));
  const identityNodes = activeNodes.filter((node) => node.type === "identity").sort((a, b) => a.label.localeCompare(b.label));
  const questNodes = activeNodes.filter((node) => node.type === "quest").sort((a, b) => a.label.localeCompare(b.label));
  const skillNodes = activeNodes.filter((node) => node.type === "skill").sort((a, b) => a.label.localeCompare(b.label));
  const actionNodes = activeNodes.filter((node) => node.type === "action").sort((a, b) => a.label.localeCompare(b.label));

  const positions = new Map<string, Point>();

  if (selfNode) {
    positions.set(selfNode.id, { x: CENTER_X, y: SELF_Y });
  }

  distributeArc({ count: interestNodes.length, radiusX: 450, radiusY: 260, start: Math.PI * 0.95, end: Math.PI * 0.05, centerY: 300 }).forEach((point, index) => {
    positions.set(interestNodes[index].id, point);
  });

  distributeArc({ count: identityNodes.length, radiusX: 250, radiusY: 170, start: Math.PI * 0.95, end: Math.PI * 0.05, centerY: 320 }).forEach((point, index) => {
    positions.set(identityNodes[index].id, point);
  });

  distributeBand({ count: questNodes.length, y: 280, width: 700, sway: 120 }).forEach((point, index) => {
    positions.set(questNodes[index].id, point);
  });

  distributeBand({ count: skillNodes.length, y: 620, width: 820, sway: 26 }).forEach((point, index) => {
    positions.set(skillNodes[index].id, point);
  });

  distributeBand({ count: actionNodes.length, y: 742, width: 920, sway: 14 }).forEach((point, index) => {
    positions.set(actionNodes[index].id, point);
  });

  return positions;
};

export const curvedPath = (from: Point, to: Point, tension = 0.18) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.max(12, Math.hypot(dx, dy));
  const sway = Math.min(120, distance * tension) * (dx >= 0 ? 1 : -1);
  const c1x = from.x + dx * 0.22 + sway;
  const c1y = from.y + dy * 0.2 - Math.abs(sway) * 0.2;
  const c2x = from.x + dx * 0.78 - sway * 0.72;
  const c2y = from.y + dy * 0.88 + Math.abs(sway) * 0.12;
  return `M ${from.x.toFixed(2)} ${from.y.toFixed(2)} C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${to.x.toFixed(2)} ${to.y.toFixed(2)}`;
};

export const structuralPathForNodes = ({
  from,
  to,
  fromType,
  toType,
}: {
  from: Point;
  to: Point;
  fromType: TreeNode["type"];
  toType: TreeNode["type"];
}) => {
  if (fromType === "identity" && toType === "self") {
    return curvedPath(from, to, 0.28);
  }
  if (fromType === "self" && toType === "quest") {
    return curvedPath(from, to, 0.32);
  }
  if (fromType === "quest" && toType === "skill") {
    return curvedPath(from, to, 0.2);
  }
  if (fromType === "skill" && toType === "action") {
    return curvedPath(from, to, 0.1);
  }
  if (fromType === "interest" && toType === "identity") {
    return curvedPath(from, to, 0.24);
  }
  return curvedPath(from, to, 0.16);
};
