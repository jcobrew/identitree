import { createEmptyWorkspace, createSeededWorkspace } from "@/lib/identitree/seed";
import type { Thread, TreeEdge, TreeNode, WorkspaceState } from "@/lib/identitree/types";

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

export const coerceWorkspaceState = (value: unknown): WorkspaceState => {
  const base = createEmptyWorkspace();
  if (!isRecord(value)) {
    return createSeededWorkspace();
  }

  const candidate = value as Partial<WorkspaceState>;
  const threads = Array.isArray(candidate.threads) ? candidate.threads : base.threads;
  const tree = isRecord(candidate.tree) ? candidate.tree : base.tree;

  return {
    ...base,
    ...candidate,
    profile: isRecord(candidate.profile) ? { ...base.profile, ...candidate.profile } : base.profile,
    tree: {
      ...base.tree,
      ...tree,
      nodes: Array.isArray(tree.nodes) ? (tree.nodes as TreeNode[]) : base.tree.nodes,
      edges: Array.isArray(tree.edges) ? (tree.edges as TreeEdge[]) : base.tree.edges,
      snapshots: Array.isArray(tree.snapshots) ? tree.snapshots : base.tree.snapshots,
    },
    threads: threads as Thread[],
    observations: Array.isArray(candidate.observations) ? candidate.observations : base.observations,
    checkInCards: Array.isArray(candidate.checkInCards) ? candidate.checkInCards : base.checkInCards,
    drafts: isRecord(candidate.drafts) ? (candidate.drafts as Record<string, string>) : base.drafts,
    treeCamera: isRecord(candidate.treeCamera)
      ? { ...base.treeCamera, ...candidate.treeCamera }
      : base.treeCamera,
    activeThreadId:
      typeof candidate.activeThreadId === "string" || candidate.activeThreadId === null
        ? candidate.activeThreadId
        : base.activeThreadId,
    selectedNodeId:
      typeof candidate.selectedNodeId === "string" || candidate.selectedNodeId === null
        ? candidate.selectedNodeId
        : base.selectedNodeId,
  };
};
