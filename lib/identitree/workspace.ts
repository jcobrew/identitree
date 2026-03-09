import { applyArchitectPass, buildCheckInCards } from "@/lib/identitree/architect";
import { getIdentitreeEnv } from "@/lib/identitree/env";
import { getNextOnboardingField, runMirrorTurn } from "@/lib/identitree/mirror";
import { coerceWorkspaceState } from "@/lib/identitree/state";
import {
  buildStarterThread,
  createId,
  createSeededWorkspace,
  createThread,
  nowIso,
  trimSentence,
} from "@/lib/identitree/seed";
import type {
  CheckInKind,
  Thread,
  ThreadKind,
  TreeEdge,
  WorkspaceState,
} from "@/lib/identitree/types";

const buildThreadPreset = ({
  starter,
  topic,
  title,
  linkedNodeLabel,
}: {
  starter?: CheckInKind;
  topic?: string;
  title?: string;
  linkedNodeLabel?: string;
}) => {
  if (starter === "light") {
    return {
      title: title?.trim() || "light reflection",
      topic: topic?.trim() || "what feels most present right now",
      kind: "reflection" as const,
      opening: "we can keep this light and honest. what feels most present right now without over-explaining it?",
    };
  }

  if (starter === "catch-up") {
    return {
      title: title?.trim() || "catch-up",
      topic: topic?.trim() || "what moved, what stalled, and what still matters",
      kind: "reflection" as const,
      opening: "let's gather the last stretch cleanly. what moved, what stalled, and what still matters?",
    };
  }

  if (starter === "tree-prompted") {
    const nodeLabel = linkedNodeLabel?.trim() || "this node";
    return {
      title: title?.trim() || `following ${nodeLabel}`,
      topic: topic?.trim() || `${nodeLabel} and what it is trying to connect`,
      kind: "quest" as const,
      opening: `${nodeLabel} is asking for attention. what is it pointing to in lived experience right now?`,
    };
  }

  return {
    title: title?.trim() || "untitled thread",
    topic: topic?.trim() || title?.trim() || "new reflection",
    kind: "exploration" as const,
    opening: `we can hold this as its own room. what is most alive inside ${topic?.trim() || title?.trim() || "this thread"} right now?`,
  };
};

export { coerceWorkspaceState } from "@/lib/identitree/state";

export const getWorkspacePayload = (value?: unknown) => {
  const workspace = value ? coerceWorkspaceState(value) : createSeededWorkspace();
  const env = getIdentitreeEnv();
  return {
    workspace: {
      ...workspace,
      checkInCards: buildCheckInCards(workspace),
    },
    capabilities: {
      anthropic: env.hasAnthropic,
      supabase: env.hasSupabase,
    },
  };
};

export const createThreadInWorkspace = ({
  workspaceInput,
  title,
  topic,
  kind,
  starter,
  linkedNodeId,
}: {
  workspaceInput?: unknown;
  title?: string;
  topic?: string;
  kind?: ThreadKind;
  starter?: CheckInKind;
  linkedNodeId?: string;
}) => {
  const workspace = coerceWorkspaceState(workspaceInput ?? createSeededWorkspace());

  if (!workspace.hasCompletedOnboarding) {
    const existingStarter = workspace.threads.find((thread) => thread.topic === "onboarding");
    const starter = existingStarter ?? buildStarterThread(workspace.threads.length);
    const threads = existingStarter ? workspace.threads : [starter, ...workspace.threads];
    const next = {
      ...workspace,
      view: "thread" as const,
      activeThreadId: starter.id,
      threads,
      drafts: { ...workspace.drafts, [starter.id]: workspace.drafts[starter.id] ?? "" },
      lastActiveAt: nowIso(),
    };
    return { workspace: { ...next, checkInCards: buildCheckInCards(next) } };
  }

  const linkedNode = linkedNodeId
    ? workspace.tree.nodes.find((node) => node.id === linkedNodeId)
    : undefined;
  const linkedNodeLabel = linkedNode?.label;
  const preset = buildThreadPreset({ starter, topic, title, linkedNodeLabel });

  const nextThread = createThread({
    title: preset.title,
    topic: preset.topic,
    kind: kind ?? preset.kind,
    index: workspace.threads.length,
  });

  nextThread.messages = [
    {
      id: createId("msg"),
      role: "mirror",
      text: preset.opening,
      createdAt: nowIso(),
      extraction: null,
    },
  ];
  nextThread.preview = nextThread.messages[0].text;
  nextThread.linkedNodeIds = linkedNode ? [linkedNode.id] : [];

  const next = {
    ...workspace,
    view: "thread" as const,
    activeThreadId: nextThread.id,
    threads: [nextThread, ...workspace.threads],
    drafts: { ...workspace.drafts, [nextThread.id]: "" },
    lastActiveAt: nowIso(),
  };

  return { workspace: { ...next, checkInCards: buildCheckInCards(next) } };
};

export const updateThreadInWorkspace = ({
  workspaceInput,
  threadId,
  title,
  topic,
  archived,
}: {
  workspaceInput?: unknown;
  threadId: string;
  title?: string;
  topic?: string;
  archived?: boolean;
}) => {
  const workspace = coerceWorkspaceState(workspaceInput ?? createSeededWorkspace());
  const threads = workspace.threads.map((thread) => {
    if (thread.id !== threadId) return thread;
    return {
      ...thread,
      title: title?.trim() || thread.title,
      topic: topic?.trim() || thread.topic,
      archived: typeof archived === "boolean" ? archived : thread.archived,
      updatedAt: nowIso(),
    };
  });

  const activeThreadWasArchived = workspace.activeThreadId === threadId && archived === true;
  const fallbackThreadId = activeThreadWasArchived
    ? threads.find((thread) => thread.id !== threadId && !thread.archived)?.id ?? null
    : workspace.activeThreadId;

  const next = {
    ...workspace,
    threads,
    activeThreadId: fallbackThreadId,
    view: fallbackThreadId ? workspace.view : "landing" as const,
    lastActiveAt: nowIso(),
  };

  return { workspace: { ...next, checkInCards: buildCheckInCards(next) } };
};

export const sendThreadMessageInWorkspace = async ({
  workspaceInput,
  threadId,
  message,
}: {
  workspaceInput?: unknown;
  threadId: string;
  message: string;
}) => {
  const workspace = coerceWorkspaceState(workspaceInput ?? createSeededWorkspace());
  const thread = workspace.threads.find((entry) => entry.id === threadId);

  if (!thread) {
    return { workspace: { ...workspace, checkInCards: buildCheckInCards(workspace) } };
  }

  const userText = trimSentence(message, 1200);
  const nextThreads = workspace.threads.map((entry) =>
    entry.id === threadId
      ? {
          ...entry,
          messages: [
            ...entry.messages,
            {
              id: createId("msg"),
              role: "user" as const,
              text: userText,
              createdAt: nowIso(),
            },
          ],
          updatedAt: nowIso(),
          preview: userText,
        }
      : entry,
  );

  const workspaceWithUserMessage: WorkspaceState = {
    ...workspace,
    threads: nextThreads,
    activeThreadId: threadId,
    view: "thread",
    drafts: { ...workspace.drafts, [threadId]: "" },
    lastActiveAt: nowIso(),
  };

  const updatedThread = workspaceWithUserMessage.threads.find((entry) => entry.id === threadId) ?? thread;
  const turn = await runMirrorTurn({
    workspace: workspaceWithUserMessage,
    thread: updatedThread,
    userMessage: userText,
  });

  const threadsWithMirror = workspaceWithUserMessage.threads.map((entry) => {
    if (entry.id !== threadId) return entry;
    const mirrorMessage = {
      id: createId("msg"),
      role: "mirror" as const,
      text: turn.mirror.message,
      createdAt: nowIso(),
      extraction: turn.mirror,
    };

    const renamedThread = !turn.completedOnboarding && getNextOnboardingField(turn.profile)
      ? entry
      : {
          ...entry,
          title: entry.topic === "onboarding" ? `${turn.profile.name || "your"} starting point` : entry.title,
          topic: entry.topic === "onboarding" ? trimSentence(turn.profile.becoming || turn.profile.doing || "first reflection", 64) : entry.topic,
        };

    return {
      ...renamedThread,
      linkedNodeIds: entry.linkedNodeIds,
      messages: [...entry.messages, mirrorMessage],
      updatedAt: nowIso(),
      preview: turn.mirror.message,
    };
  });

  const workspaceWithMirror: WorkspaceState = {
    ...workspaceWithUserMessage,
    profile: turn.profile,
    hasCompletedOnboarding: turn.completedOnboarding,
    threads: threadsWithMirror,
  };

  const currentThread = workspaceWithMirror.threads.find((entry) => entry.id === threadId) ?? updatedThread;
  const architectResult = applyArchitectPass({
    workspace: workspaceWithMirror,
    thread: currentThread,
    mirror: turn.mirror,
  });

  const finalThreads = architectResult.workspace.threads.map((entry) =>
    entry.id === threadId
      ? {
          ...entry,
          linkedNodeIds: architectResult.linkedNodeIds,
        }
      : entry,
  );

  const next: WorkspaceState = {
    ...architectResult.workspace,
    threads: finalThreads,
    selectedNodeId: architectResult.linkedNodeIds.at(-1) ?? architectResult.workspace.selectedNodeId,
    graphPreviewOpen: false,
    lastActiveAt: nowIso(),
  };

  return { workspace: { ...next, checkInCards: buildCheckInCards(next) } };
};

export const patchNodeInWorkspace = ({
  workspaceInput,
  nodeId,
  label,
  insight,
  archived,
  mergeIntoId,
}: {
  workspaceInput?: unknown;
  nodeId: string;
  label?: string;
  insight?: string;
  archived?: boolean;
  mergeIntoId?: string;
}) => {
  const workspace = coerceWorkspaceState(workspaceInput ?? createSeededWorkspace());

  let nodes = [...workspace.tree.nodes];
  let edges = [...workspace.tree.edges];
  let threads = [...workspace.threads];

  if (mergeIntoId) {
    const sourceNode = nodes.find((node) => node.id === nodeId);
    const targetNode = nodes.find((node) => node.id === mergeIntoId);

    if (sourceNode && targetNode && sourceNode.type === targetNode.type && sourceNode.id !== targetNode.id) {
      targetNode.sourceThreadIds = [...new Set([...targetNode.sourceThreadIds, ...sourceNode.sourceThreadIds])];
      targetNode.aliases = [...new Set([...targetNode.aliases, sourceNode.label, ...sourceNode.aliases])];
      targetNode.insight = insight?.trim() || targetNode.insight;

      edges = edges.map((edge) => ({
        ...edge,
        fromId: edge.fromId === sourceNode.id ? targetNode.id : edge.fromId,
        toId: edge.toId === sourceNode.id ? targetNode.id : edge.toId,
      }));

      edges = edges.filter(
        (edge, index) => edge.fromId !== edge.toId && edges.findIndex((candidate) => candidate.fromId === edge.fromId && candidate.toId === edge.toId) === index,
      );

      threads = threads.map((thread) => ({
        ...thread,
        linkedNodeIds: thread.linkedNodeIds.map((id) => (id === sourceNode.id ? targetNode.id : id)).filter((id, index, array) => array.indexOf(id) === index),
      }));

      nodes = nodes.filter((node) => node.id !== sourceNode.id);
    }
  }

  nodes = nodes.map((node) => {
    if (node.id !== (mergeIntoId ? mergeIntoId : nodeId)) return node;
    return {
      ...node,
      label: label?.trim() || node.label,
      insight: insight?.trim() || node.insight,
      archived: typeof archived === "boolean" ? archived : node.archived,
    };
  });

  const next: WorkspaceState = {
    ...workspace,
    threads,
    tree: {
      ...workspace.tree,
      nodes,
      edges,
    },
    lastActiveAt: nowIso(),
  };

  return { workspace: { ...next, checkInCards: buildCheckInCards(next) } };
};

export const reviewEdgeInWorkspace = ({
  workspaceInput,
  edgeId,
  decision,
}: {
  workspaceInput?: unknown;
  edgeId: string;
  decision: "accept" | "reject";
}) => {
  const workspace = coerceWorkspaceState(workspaceInput ?? createSeededWorkspace());
  const edges: TreeEdge[] = workspace.tree.edges.map((edge) => {
    if (edge.id !== edgeId) return edge;
    return {
      ...edge,
      status: decision === "accept" ? "active" : "rejected",
    };
  });

  const next: WorkspaceState = {
    ...workspace,
    tree: {
      ...workspace.tree,
      edges,
    },
    lastActiveAt: nowIso(),
  };

  return { workspace: { ...next, checkInCards: buildCheckInCards(next) } };
};
