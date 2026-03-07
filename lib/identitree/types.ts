import { z } from "zod";

export const NODE_TYPES = ["identity", "interest", "quest", "self", "skill", "action"] as const;
export type NodeType = (typeof NODE_TYPES)[number];

export const THREAD_KINDS = ["domain", "quest", "exploration", "reflection"] as const;
export type ThreadKind = (typeof THREAD_KINDS)[number];

export const WORKSPACE_VIEWS = ["landing", "thread", "tree"] as const;
export type WorkspaceView = (typeof WORKSPACE_VIEWS)[number];

export const CHECKIN_KINDS = ["light", "catch-up", "tree-prompted", "continue"] as const;
export type CheckInKind = (typeof CHECKIN_KINDS)[number];

export type ThreadMessage = {
  id: string;
  role: "mirror" | "user";
  text: string;
  createdAt: string;
  extraction?: MirrorResponse | null;
};

export type Thread = {
  id: string;
  kind: ThreadKind;
  title: string;
  topic: string;
  emoji: string;
  color: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  preview: string;
  linkedNodeIds: string[];
  messages: ThreadMessage[];
};

export type TreeNode = {
  id: string;
  type: NodeType;
  label: string;
  insight: string;
  firstSourceThreadId: string;
  sourceThreadIds: string[];
  archived: boolean;
  status: "active" | "suggested";
  aliases: string[];
};

export type TreeEdge = {
  id: string;
  fromId: string;
  toId: string;
  reason: string;
  crossThread: boolean;
  sourceThreadIds: string[];
  status: "active" | "suggested" | "rejected";
};

export type TreeSnapshot = {
  id: string;
  createdAt: string;
  nodes: TreeNode[];
  edges: TreeEdge[];
  focusThreadId: string | null;
};

export type ArchitectObservation = {
  id: string;
  kind: "bridge" | "pattern" | "momentum" | "drift";
  title: string;
  body: string;
  threadIds: string[];
  nodeIds: string[];
  createdAt: string;
};

export type CheckInCard = {
  id: string;
  kind: CheckInKind;
  title: string;
  body: string;
  actionLabel: string;
  threadId?: string;
  nodeId?: string;
};

export type UserProfile = {
  id: string;
  name: string;
  currentLandscape: string;
  doing: string;
  becoming: string;
};

export type TreeCamera = {
  x: number;
  y: number;
  zoom: number;
};

export type WorkspaceState = {
  version: number;
  view: WorkspaceView;
  activeThreadId: string | null;
  selectedNodeId: string | null;
  graphPreviewOpen: boolean;
  profile: UserProfile;
  hasCompletedOnboarding: boolean;
  accountMode: "local-preview" | "cloud-ready";
  threads: Thread[];
  tree: {
    id: string;
    nodes: TreeNode[];
    edges: TreeEdge[];
    snapshots: TreeSnapshot[];
  };
  observations: ArchitectObservation[];
  checkInCards: CheckInCard[];
  treeCamera: TreeCamera;
  drafts: Record<string, string>;
  lastActiveAt: string;
};

export type MirrorNodeInput = {
  type: NodeType;
  label: string;
  insight: string;
};

export type MirrorEdgeInput = {
  fromLabel: string;
  toLabel: string;
  reason: string;
};

export type MirrorResponse = {
  message: string;
  nodes: MirrorNodeInput[];
  edges: MirrorEdgeInput[];
};

export const mirrorResponseSchema = z.object({
  message: z.string().min(1),
  nodes: z.array(
    z.object({
      type: z.enum(NODE_TYPES),
      label: z.string().min(1),
      insight: z.string().min(1),
    }),
  ),
  edges: z.array(
    z.object({
      fromLabel: z.string().min(1),
      toLabel: z.string().min(1),
      reason: z.string().min(1),
    }),
  ),
});

export const threadCreateRequestSchema = z.object({
  state: z.unknown().optional(),
  title: z.string().trim().min(1).max(72).optional(),
  topic: z.string().trim().min(1).max(160).optional(),
  kind: z.enum(THREAD_KINDS).optional(),
});

export const threadUpdateRequestSchema = z.object({
  state: z.unknown().optional(),
  title: z.string().trim().min(1).max(72).optional(),
  topic: z.string().trim().min(1).max(160).optional(),
  archived: z.boolean().optional(),
});

export const threadMessageRequestSchema = z.object({
  state: z.unknown().optional(),
  message: z.string().trim().min(1).max(4000),
});

export const nodePatchRequestSchema = z.object({
  state: z.unknown().optional(),
  label: z.string().trim().min(1).max(72).optional(),
  insight: z.string().trim().min(1).max(320).optional(),
  archived: z.boolean().optional(),
  mergeIntoId: z.string().trim().min(1).optional(),
});

export const edgeReviewRequestSchema = z.object({
  state: z.unknown().optional(),
  decision: z.enum(["accept", "reject"]),
});

export const workspaceEnvelopeSchema = z.object({
  workspace: z.unknown(),
  capabilities: z
    .object({
      anthropic: z.boolean(),
      supabase: z.boolean(),
    })
    .optional(),
});

export type WorkspaceEnvelope = z.infer<typeof workspaceEnvelopeSchema>;

export const ONBOARDING_FIELDS = ["name", "currentLandscape", "doing", "becoming"] as const;
export type OnboardingField = (typeof ONBOARDING_FIELDS)[number];

export type StarterNodeTemplate = {
  label: string;
  keywords: string[];
  insight: string;
};
