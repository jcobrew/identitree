import {
  SAMPLE_TREE_SNAPSHOT,
  createId,
  normalizeLabel,
  nowIso,
  toList,
  trimSentence,
} from "@/lib/identitree/seed";
import type {
  ArchitectObservation,
  CheckInCard,
  MirrorResponse,
  Thread,
  TreeEdge,
  TreeNode,
  WorkspaceState,
} from "@/lib/identitree/types";

const uniqueStrings = (items: string[]) => [...new Set(items.filter(Boolean))];

const ensureSelfNode = (nodes: TreeNode[]) => {
  const existing = nodes.find((node) => node.type === "self");
  if (existing) return nodes;
  const selfNode: TreeNode = {
    id: "node-self",
    type: "self",
    label: "self",
    insight: "the trunk keeps the different threads in the same living body.",
    firstSourceThreadId: "thread-seed",
    sourceThreadIds: ["thread-seed"],
    archived: false,
    status: "active",
    aliases: ["self"],
  };
  return [
    selfNode,
    ...nodes,
  ];
};

const findNodeByLabel = (nodes: TreeNode[], label: string, type?: TreeNode["type"]) => {
  const normalized = normalizeLabel(label);
  return nodes.find((node) => {
    if (type && node.type !== type) return false;
    return [node.label, ...node.aliases].some((alias) => normalizeLabel(alias) === normalized);
  });
};

const resolveEdgeStatus = (existing: TreeEdge | undefined, nextCrossThread: boolean) => {
  if (!existing) return nextCrossThread ? "suggested" : "active";
  if (existing.status === "rejected") return existing.status;
  if (existing.status === "active") return "active";
  return nextCrossThread ? "suggested" : existing.status;
};

export const applyArchitectPass = ({
  workspace,
  thread,
  mirror,
}: {
  workspace: WorkspaceState;
  thread: Thread;
  mirror: MirrorResponse;
}) => {
  let nodes = ensureSelfNode([...workspace.tree.nodes]);
  const linkedNodeIds = [...thread.linkedNodeIds];

  for (const candidate of mirror.nodes) {
    const existing = findNodeByLabel(nodes, candidate.label, candidate.type);
    if (existing) {
      existing.insight = candidate.insight || existing.insight;
      existing.sourceThreadIds = uniqueStrings([...existing.sourceThreadIds, thread.id]);
      existing.aliases = uniqueStrings([...existing.aliases, candidate.label]);
      if (!linkedNodeIds.includes(existing.id)) linkedNodeIds.push(existing.id);
      continue;
    }

    const newNode: TreeNode = {
      id: createId("node"),
      type: candidate.type,
      label: trimSentence(candidate.label, 42),
      insight: trimSentence(candidate.insight, 220),
      firstSourceThreadId: thread.id,
      sourceThreadIds: [thread.id],
      archived: false,
      status: "active",
      aliases: [candidate.label],
    };

    nodes.push(newNode);
    linkedNodeIds.push(newNode.id);
  }

  const edges = [...workspace.tree.edges];

  for (const candidate of mirror.edges) {
    const fromNode = findNodeByLabel(nodes, candidate.fromLabel);
    const toNode = findNodeByLabel(nodes, candidate.toLabel);
    if (!fromNode || !toNode || fromNode.id === toNode.id) continue;

    const sourceThreadIds = uniqueStrings([...fromNode.sourceThreadIds, ...toNode.sourceThreadIds, thread.id]);
    const crossThread = sourceThreadIds.length > 1;
    const existing = edges.find(
      (edge) => edge.fromId === fromNode.id && edge.toId === toNode.id,
    );

    if (existing) {
      existing.reason = trimSentence(candidate.reason, 180);
      existing.sourceThreadIds = uniqueStrings([...existing.sourceThreadIds, ...sourceThreadIds]);
      existing.crossThread = existing.crossThread || crossThread;
      existing.status = resolveEdgeStatus(existing, crossThread);
      continue;
    }

    edges.push({
      id: createId("edge"),
      fromId: fromNode.id,
      toId: toNode.id,
      reason: trimSentence(candidate.reason, 180),
      crossThread,
      sourceThreadIds,
      status: crossThread ? "suggested" : "active",
    });
  }

  const questToSkillEdges = edges.filter((edge) => edge.status !== "rejected").filter((edge) => {
    const fromNode = nodes.find((node) => node.id === edge.fromId);
    const toNode = nodes.find((node) => node.id === edge.toId);
    return fromNode?.type === "quest" && toNode?.type === "skill";
  });

  const skillToQuestMap = new Map<string, TreeNode[]>();
  for (const edge of questToSkillEdges) {
    const skillNode = nodes.find((node) => node.id === edge.toId);
    const questNode = nodes.find((node) => node.id === edge.fromId);
    if (!skillNode || !questNode) continue;
    const existing = skillToQuestMap.get(skillNode.id) ?? [];
    existing.push(questNode);
    skillToQuestMap.set(skillNode.id, existing);
  }

  for (const [skillId, questNodes] of skillToQuestMap.entries()) {
    for (let index = 0; index < questNodes.length; index += 1) {
      for (let pairIndex = index + 1; pairIndex < questNodes.length; pairIndex += 1) {
        const left = questNodes[index];
        const right = questNodes[pairIndex];
        if (left.firstSourceThreadId === right.firstSourceThreadId) continue;

        const existing = edges.find(
          (edge) => edge.fromId === left.id && edge.toId === right.id,
        );
        const skillNode = nodes.find((node) => node.id === skillId);
        if (existing || !skillNode) continue;

        edges.push({
          id: createId("edge"),
          fromId: left.id,
          toId: right.id,
          reason: `${skillNode.label} is bridging both branches`,
          crossThread: true,
          sourceThreadIds: uniqueStrings([...left.sourceThreadIds, ...right.sourceThreadIds]),
          status: "suggested",
        });
      }
    }
  }

  const bridgeNodes = nodes.filter((node) => node.sourceThreadIds.length > 1 && !node.archived);
  const suggestedBridges = edges.filter((edge) => edge.crossThread && edge.status === "suggested");
  const latestObservationAt = nowIso();

  const observations: ArchitectObservation[] = [];

  if (bridgeNodes.length > 0) {
    observations.push({
      id: createId("obs"),
      kind: "bridge",
      title: "a bridge is starting to form",
      body: `${bridgeNodes[0]?.label} is now being fed by ${bridgeNodes[0]?.sourceThreadIds.length} different threads. this is usually where identity starts feeling more coherent.`,
      threadIds: bridgeNodes[0]?.sourceThreadIds ?? [],
      nodeIds: bridgeNodes.slice(0, 3).map((node) => node.id),
      createdAt: latestObservationAt,
    });
  }

  if (suggestedBridges.length > 0) {
    const first = suggestedBridges[0];
    const fromNode = nodes.find((node) => node.id === first.fromId);
    const toNode = nodes.find((node) => node.id === first.toId);
    observations.push({
      id: createId("obs"),
      kind: "pattern",
      title: "two threads may belong to the same pattern",
      body: `${fromNode?.label ?? "one branch"} and ${toNode?.label ?? "another branch"} may be part of the same deeper movement. review the bridge before it hardens into the tree.`,
      threadIds: first.sourceThreadIds,
      nodeIds: [first.fromId, first.toId],
      createdAt: latestObservationAt,
    });
  }

  if (linkedNodeIds.length > 0) {
    observations.push({
      id: createId("obs"),
      kind: "momentum",
      title: "this thread is producing proof",
      body: `${thread.title} is now linked to ${linkedNodeIds.length} tree ${linkedNodeIds.length === 1 ? "node" : "nodes"}. the tree is no longer abstract here.`,
      threadIds: [thread.id],
      nodeIds: linkedNodeIds.slice(0, 4),
      createdAt: latestObservationAt,
    });
  }

  const snapshots = [
    {
      id: createId("snapshot"),
      createdAt: latestObservationAt,
      nodes,
      edges,
      focusThreadId: thread.id,
    },
    ...workspace.tree.snapshots,
  ].slice(0, 8);

  const nextWorkspace: WorkspaceState = {
    ...workspace,
    tree: {
      ...workspace.tree,
      nodes,
      edges,
      snapshots,
    },
    observations: [...observations, ...workspace.observations].slice(0, 8),
  };

  return {
    workspace: nextWorkspace,
    linkedNodeIds,
  };
};

export const buildCheckInCards = (workspace: WorkspaceState): CheckInCard[] => {
  if (!workspace.hasCompletedOnboarding) {
    return workspace.threads.length > 0
      ? [
          {
            id: "card-light",
            kind: "light",
            title: "continue the opening reflection",
            body: "the tree only needs one honest thread to begin taking shape.",
            actionLabel: "continue reflection",
            threadId: workspace.activeThreadId ?? workspace.threads[0]?.id,
          },
          {
            id: "card-open-tree",
            kind: "tree-prompted",
            title: "see the builder journey",
            body: "walk through how make something turns setup, build, fixing, and shipping into a builder identity.",
            actionLabel: "see builder journey",
          },
        ]
      : [];
  }

  const lastThread = [...workspace.threads].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  const daysSinceActive = Math.floor((Date.now() - new Date(workspace.lastActiveAt).getTime()) / 86400000);
  const bridgeNode = workspace.tree.nodes.find((node) => node.sourceThreadIds.length > 1 && !node.archived);
  const recentSnapshot = workspace.tree.snapshots[0] ?? SAMPLE_TREE_SNAPSHOT;
  const identityLabels = recentSnapshot.nodes.filter((node) => node.type === "identity" && !node.archived).map((node) => node.label);

  const cards: CheckInCard[] = [
    {
      id: "card-light",
      kind: "light",
      title: "light reflection",
      body: "drop one honest sentence into the active thread and let the architect do the sorting.",
      actionLabel: "continue reflection",
      threadId: workspace.activeThreadId ?? lastThread?.id,
    },
    {
      id: "card-catch-up",
      kind: "catch-up",
      title: daysSinceActive >= 3 ? "catch up with the last few days" : "log the last small proof",
      body:
        daysSinceActive >= 3
          ? "name what moved, what stalled, and what still matters before the tree gets noisy."
          : "the strongest trees usually grow through small visible proof, not dramatic reinvention.",
      actionLabel: "open catch-up",
      threadId: lastThread?.id,
    },
    {
      id: "card-tree",
      kind: "tree-prompted",
      title: bridgeNode ? `follow ${bridgeNode.label}` : "open the tree",
      body: bridgeNode
        ? `${bridgeNode.label} is now being fed by multiple threads. trace it to see where your identity is converging.`
        : `right now the main fruit are ${toList(identityLabels.slice(0, 3)) || "still forming"}.`,
      actionLabel: bridgeNode ? "trace bridge" : "open tree",
      nodeId: bridgeNode?.id,
    },
    {
      id: "card-continue",
      kind: "continue",
      title: lastThread ? `continue ${lastThread.title}` : "continue where you left off",
      body: lastThread
        ? trimSentence(lastThread.preview || "pick up the thread where it last felt alive.", 120)
        : "return to the thread that still has heat in it.",
      actionLabel: "continue where we left off",
      threadId: lastThread?.id,
    },
  ];

  return cards;
};
