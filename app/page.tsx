"use client";

import { Card, CardBody, Spinner } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { IntroDemoView } from "@/components/identitree/IntroDemoView";
import { LandingView } from "@/components/identitree/LandingView";
import { ThreadSwitcherModal } from "@/components/identitree/ThreadSwitcherModal";
import { ThreadSettingsModal } from "@/components/identitree/ThreadSettingsModal";
import { ThreadWorkspace } from "@/components/identitree/ThreadWorkspace";
import { TreeMap } from "@/components/identitree/TreeMap";
import { TreeWorkspace } from "@/components/identitree/TreeWorkspace";
import { WorkspaceHeader } from "@/components/identitree/WorkspaceHeader";
import { buildCheckInCards } from "@/lib/identitree/architect";
import {
  DEMO_WORKSPACE,
  FIRST_TIME_CARDS,
  ONBOARDING_COPY,
  SAMPLE_THREADS,
  SAMPLE_INSIGHTS,
  SAMPLE_TREE_EDGES,
  SAMPLE_TREE_NODES,
  TRIBUTE_DEMO_CHAPTERS,
  createBuilderStarterWorkspace,
  createFreshWorkspaceFromTribute,
} from "@/lib/identitree/seed";
import { readWorkspaceFromStorage, writeWorkspaceToStorage } from "@/lib/identitree/storage";
import type {
  CheckInCard,
  OnboardingField,
  ThreadKind,
  WorkspaceState,
} from "@/lib/identitree/types";
import { ONBOARDING_FIELDS } from "@/lib/identitree/types";

const previewCamera = { x: 0, y: -20, zoom: 0.92 };

const formatTouchedLabel = (value: string) => {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (hours < 1) return "touched just now";
  if (hours < 24) return `touched ${hours}h ago`;
  if (days === 1) return "touched yesterday";
  if (days < 7) return `touched ${days}d ago`;
  return `touched ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
};

const nextField = (workspace: WorkspaceState): OnboardingField | null => {
  for (const field of ONBOARDING_FIELDS) {
    if (!workspace.profile[field].trim()) return field;
  }
  return null;
};

export default function Home() {
  const [workspace, setWorkspace] = useState<WorkspaceState | null>(null);
  const [capabilities, setCapabilities] = useState({ anthropic: false, supabase: false });
  const [threadSwitcherOpen, setThreadSwitcherOpen] = useState(false);
  const [threadSettingsOpen, setThreadSettingsOpen] = useState(false);
  const [tributeChapterIndex, setTributeChapterIndex] = useState(0);
  const [tributeSelectedNodeId, setTributeSelectedNodeId] = useState<string | null>(TRIBUTE_DEMO_CHAPTERS[0]?.focusNodeIds[0] ?? null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (typeof window !== "undefined" && window.localStorage.getItem("identitree-v3-workspace")) {
        if (!cancelled) {
          setWorkspace(readWorkspaceFromStorage());
        }
        return;
      }

      const response = await fetch("/api/workspace");
      const payload = (await response.json()) as { workspace: WorkspaceState; capabilities?: { anthropic: boolean; supabase: boolean } };
      if (!cancelled) {
        setWorkspace(payload.workspace);
        setCapabilities(payload.capabilities ?? { anthropic: false, supabase: false });
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!workspace) return;
    writeWorkspaceToStorage(workspace);
  }, [workspace]);

  const performWorkspaceRequest = async (url: string, options: RequestInit) => {
    if (!workspace) return;
    setBusy(true);
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers ?? {}),
        },
      });
      const payload = (await response.json()) as { workspace: WorkspaceState; capabilities?: { anthropic: boolean; supabase: boolean } };
      if (payload.workspace) {
        setWorkspace(payload.workspace);
      }
      if (payload.capabilities) {
        setCapabilities(payload.capabilities);
      }
    } finally {
      setBusy(false);
    }
  };

  const updateLocalWorkspace = (updater: (current: WorkspaceState) => WorkspaceState) => {
    setWorkspace((current) => (current ? updater(current) : current));
  };

  const currentWorkspace = workspace ?? DEMO_WORKSPACE;
  const hasPersonalProgress =
    currentWorkspace.hasCompletedOnboarding ||
    currentWorkspace.threads.some((thread) => thread.messages.some((message) => message.role === "user"));
  const showIntroDemo = currentWorkspace.view === "tribute" || (!hasPersonalProgress && !currentWorkspace.hasSeenTributeDemo);
  const currentThread =
    currentWorkspace.threads.find((thread) => thread.id === currentWorkspace.activeThreadId) ??
    currentWorkspace.threads[0] ??
    null;
  const currentTributeChapter = TRIBUTE_DEMO_CHAPTERS[tributeChapterIndex] ?? TRIBUTE_DEMO_CHAPTERS[0];

  const showingPersonalTree = currentWorkspace.hasCompletedOnboarding || currentWorkspace.starterMode === "fresh";
  const treeNodes = showingPersonalTree ? currentWorkspace.tree.nodes : SAMPLE_TREE_NODES;
  const treeEdges = showingPersonalTree ? currentWorkspace.tree.edges : SAMPLE_TREE_EDGES;
  const treeThreads = showingPersonalTree ? currentWorkspace.threads : SAMPLE_THREADS;

  const selectedNode = treeNodes.find((node) => node.id === currentWorkspace.selectedNodeId) ?? null;
  const selectedNodeSourceThreads = selectedNode
    ? treeThreads.filter((thread) => selectedNode.sourceThreadIds.includes(thread.id))
    : [];
  const selectedNodeBridgeEdges = selectedNode
    ? treeEdges.filter(
        (edge) => edge.crossThread && edge.status !== "rejected" && (edge.fromId === selectedNode.id || edge.toId === selectedNode.id),
      )
    : [];
  const mergeTargets = selectedNode
    ? currentWorkspace.tree.nodes.filter(
        (node) => node.id !== selectedNode.id && node.type === selectedNode.type && !node.archived,
      )
    : [];
  const tributeSelectedNode =
    SAMPLE_TREE_NODES.find((node) => node.id === tributeSelectedNodeId) ??
    SAMPLE_TREE_NODES.find((node) => node.id === currentTributeChapter?.focusNodeIds[0]) ??
    null;

  useEffect(() => {
    if (!showIntroDemo || !currentTributeChapter) return;
    setTributeSelectedNodeId((currentId) =>
      currentId && currentTributeChapter.focusNodeIds.includes(currentId)
        ? currentId
        : currentTributeChapter.focusNodeIds[0] ?? null,
    );
  }, [currentTributeChapter, showIntroDemo]);

  const threadSuggestions = useMemo(() => {
    if (!currentThread) return [];
    if (!currentWorkspace.hasCompletedOnboarding) {
      const field = nextField(currentWorkspace);
      return field ? ONBOARDING_COPY[field].suggestions : [];
    }
    return [
      "name the real friction underneath this",
      "turn this into one concrete action",
      "show me where this connects to another thread",
    ];
  }, [currentThread, currentWorkspace]);

  const relatedNodes = useMemo(() => {
    if (!currentThread) return [];
    return currentWorkspace.tree.nodes.filter(
      (node) => currentThread.linkedNodeIds.includes(node.id) && !node.archived,
    );
  }, [currentThread, currentWorkspace.tree.nodes]);

  const threadObservations = useMemo(() => {
    if (!currentThread) return currentWorkspace.observations.slice(0, 3);
    const scoped = currentWorkspace.observations.filter((observation) => observation.threadIds.includes(currentThread.id));
    return scoped.length > 0 ? scoped.slice(0, 3) : currentWorkspace.observations.slice(0, 3);
  }, [currentThread, currentWorkspace.observations]);

  const currentDraft = currentThread ? currentWorkspace.drafts[currentThread.id] ?? "" : "";
  const landingCards = currentWorkspace.checkInCards.length > 0 ? currentWorkspace.checkInCards : FIRST_TIME_CARDS;
  const activeNonArchivedThreads = useMemo(
    () => currentWorkspace.threads.filter((thread) => !thread.archived).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [currentWorkspace.threads],
  );
  const recentThreads = useMemo(
    () =>
      activeNonArchivedThreads.slice(0, 4).map((thread) => ({
        id: thread.id,
        title: thread.title,
        topic: thread.topic,
        preview: thread.preview,
        nodeCount: thread.linkedNodeIds.length,
        touchedLabel: formatTouchedLabel(thread.updatedAt),
        isActive: thread.id === currentWorkspace.activeThreadId,
      })),
    [activeNonArchivedThreads, currentWorkspace.activeThreadId],
  );
  const bridgeNode = useMemo(
    () => currentWorkspace.tree.nodes.find((node) => node.sourceThreadIds.length > 1 && !node.archived) ?? null,
    [currentWorkspace.tree.nodes],
  );
  const observationNotes = useMemo(
    () => currentWorkspace.observations.slice(0, 2).map((observation) => ({ title: observation.title, body: observation.body })),
    [currentWorkspace.observations],
  );
  const landingNotes = hasPersonalProgress
    ? observationNotes.length > 0
      ? observationNotes
      : SAMPLE_INSIGHTS.map((insight, index) => ({ title: index === 0 ? "signal" : "pattern", body: insight }))
    : SAMPLE_INSIGHTS.map((insight, index) => ({ title: index === 0 ? "signal" : "pattern", body: insight }));
  const continueCard = landingCards.find((card) => card.kind === "continue") ?? landingCards[0] ?? null;
  const secondaryCard =
    landingCards.find((card) => card.kind === "tree-prompted") ??
    landingCards.find((card) => card.kind === "catch-up") ??
    landingCards[1] ??
    null;
  const featuredEntry = continueCard
    ? {
        title: recentThreads[0] ? `resume ${recentThreads[0].title}` : continueCard.title,
        body: recentThreads[0]?.preview || continueCard.body,
        actionLabel: continueCard.actionLabel,
        meta: recentThreads[0]
          ? `${recentThreads[0].nodeCount} ${recentThreads[0].nodeCount === 1 ? "node" : "nodes"} · ${recentThreads[0].touchedLabel}`
          : "pick up the room that still has heat in it",
      }
    : {
        title: "start the first thread",
        body: "one honest room is enough for the tree to begin taking shape.",
        actionLabel: "start reflection",
        meta: "the mirror will hold the first thread for you",
      };
  const secondaryEntry = secondaryCard
    ? {
        title: secondaryCard.title,
        body:
          secondaryCard.kind === "tree-prompted" && bridgeNode
            ? `${bridgeNode.label} is being fed by ${bridgeNode.sourceThreadIds.length} threads already. follow it if you want the clearest signal.`
            : secondaryCard.body,
        actionLabel: secondaryCard.actionLabel,
        meta: secondaryCard.kind === "tree-prompted" ? "follow the strongest signal in the tree" : "take a broader re-entry pass",
      }
    : null;

  const openThread = (threadId: string) => {
    const thread = currentWorkspace.threads.find((entry) => entry.id === threadId);
    if (!thread) {
      void startReflection();
      return;
    }

    updateLocalWorkspace((current) => ({
      ...current,
      view: "thread",
      activeThreadId: threadId,
    }));
    setThreadSwitcherOpen(false);
  };

  const startReflection = async () => {
    if (currentThread) {
      updateLocalWorkspace((current) => ({
        ...current,
        view: "thread",
      }));
      return;
    }

    await performWorkspaceRequest("/api/threads", {
      method: "POST",
      body: JSON.stringify({ state: currentWorkspace }),
    });
  };

  const openTributeDemo = (index = 0) => {
    const clampedIndex = Math.max(0, Math.min(index, TRIBUTE_DEMO_CHAPTERS.length - 1));
    setTributeChapterIndex(clampedIndex);
    setTributeSelectedNodeId(TRIBUTE_DEMO_CHAPTERS[clampedIndex]?.focusNodeIds[0] ?? null);
    updateLocalWorkspace((current) => ({
      ...current,
      view: "tribute",
    }));
  };

  const closeTributeDemo = () => {
    updateLocalWorkspace((current) => ({
      ...current,
      view: "landing",
      hasSeenTributeDemo: true,
      selectedNodeId: null,
    }));
  };

  const startFreshFromTribute = () => {
    const next = createFreshWorkspaceFromTribute();
    setWorkspace({ ...next, checkInCards: buildCheckInCards(next) });
    setTributeChapterIndex(0);
    setTributeSelectedNodeId(TRIBUTE_DEMO_CHAPTERS[0]?.focusNodeIds[0] ?? null);
  };

  const startBuilderFromTribute = () => {
    const next = createBuilderStarterWorkspace();
    setWorkspace({ ...next, checkInCards: buildCheckInCards(next) });
    setTributeChapterIndex(0);
    setTributeSelectedNodeId(TRIBUTE_DEMO_CHAPTERS[0]?.focusNodeIds[0] ?? null);
  };

  const createThread = async (payload: { title: string; topic: string; kind: ThreadKind }) => {
    await performWorkspaceRequest("/api/threads", {
      method: "POST",
      body: JSON.stringify({ state: currentWorkspace, ...payload }),
    });
    setThreadSwitcherOpen(false);
  };

  const createStarterThread = async (starter: CheckInCard["kind"], linkedNodeId?: string) => {
    await performWorkspaceRequest("/api/threads", {
      method: "POST",
      body: JSON.stringify({ state: currentWorkspace, starter, linkedNodeId }),
    });
  };

  const updateThread = async (payload: { title?: string; topic?: string; archived?: boolean }) => {
    if (!currentThread) return;
    await performWorkspaceRequest(`/api/threads/${currentThread.id}`, {
      method: "PATCH",
      body: JSON.stringify({ state: currentWorkspace, ...payload }),
    });
  };

  const sendThreadMessage = async () => {
    if (!currentThread || !currentDraft.trim()) return;
    await performWorkspaceRequest(`/api/threads/${currentThread.id}/messages`, {
      method: "POST",
      body: JSON.stringify({ state: currentWorkspace, message: currentDraft.trim() }),
    });
  };

  const patchSelectedNode = async (payload: { label?: string; insight?: string; archived?: boolean; mergeIntoId?: string }) => {
    if (!selectedNode || !showingPersonalTree) return;
    await performWorkspaceRequest(`/api/tree/nodes/${selectedNode.id}`, {
      method: "PATCH",
      body: JSON.stringify({ state: currentWorkspace, ...payload }),
    });
  };

  const reviewEdge = async (edgeId: string, decision: "accept" | "reject") => {
    if (!showingPersonalTree) return;
    await performWorkspaceRequest(`/api/tree/edges/${edgeId}/review`, {
      method: "POST",
      body: JSON.stringify({ state: currentWorkspace, decision }),
    });
  };

  const handleCardPress = (card: CheckInCard) => {
    if (card.nodeId && currentWorkspace.hasCompletedOnboarding) {
      void createStarterThread("tree-prompted", card.nodeId);
      return;
    }

    if (card.nodeId) {
      updateLocalWorkspace((current) => ({
        ...current,
        view: "tree",
        selectedNodeId: card.nodeId ?? current.selectedNodeId,
      }));
      return;
    }

    if (card.threadId) {
      openThread(card.threadId);
      return;
    }

    if (!currentWorkspace.hasCompletedOnboarding) {
      if (card.kind === "tree-prompted") {
        openTributeDemo();
        return;
      }

      void startReflection();
      return;
    }

    if (card.kind === "light" || card.kind === "catch-up") {
      void createStarterThread(card.kind);
      return;
    }

    if (card.kind === "tree-prompted") {
      updateLocalWorkspace((current) => ({ ...current, view: "tree" }));
      return;
    }

    void startReflection();
  };

  if (!workspace) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f3ed]">
        <Card className="border border-black/5 bg-white/85 shadow-[0_20px_50px_rgba(32,24,18,0.05)]">
          <CardBody className="flex items-center gap-4 px-8 py-8 text-[#171411]">
            <Spinner size="sm" color="default" />
            <div>
              <p className="font-[family-name:var(--font-instrument-serif)] text-2xl leading-none">opening identitree</p>
              <p className="mt-2 text-sm text-black/55">building the landing, the mirror rooms, and the tree map.</p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-[family-name:var(--font-manrope)] text-[#171411]">
      {showIntroDemo ? (
        <IntroDemoView
          chapter={currentTributeChapter}
          chapterIndex={tributeChapterIndex}
          chapterCount={TRIBUTE_DEMO_CHAPTERS.length}
          nodes={SAMPLE_TREE_NODES}
          edges={SAMPLE_TREE_EDGES}
          threads={SAMPLE_THREADS}
          selectedNode={tributeSelectedNode}
          onBack={() => setTributeChapterIndex((current) => Math.max(0, current - 1))}
          onNext={() => setTributeChapterIndex((current) => Math.min(TRIBUTE_DEMO_CHAPTERS.length - 1, current + 1))}
          onSkip={closeTributeDemo}
          onSelectNode={setTributeSelectedNodeId}
          onStartFresh={startFreshFromTribute}
          onStartBuilderStarter={startBuilderFromTribute}
        />
      ) : currentWorkspace.view === "landing" ? (
        <LandingView
          isReturning={hasPersonalProgress}
          cards={landingCards}
          featuredCard={continueCard}
          secondaryCard={secondaryCard}
          featuredEntry={featuredEntry}
          secondaryEntry={secondaryEntry}
          notes={landingNotes}
          recentThreads={recentThreads}
          treePreview={
            <TreeMap
              nodes={showingPersonalTree ? treeNodes : SAMPLE_TREE_NODES}
              edges={showingPersonalTree ? treeEdges : SAMPLE_TREE_EDGES}
              threads={showingPersonalTree ? treeThreads : SAMPLE_THREADS}
              selectedNodeId={null}
              camera={previewCamera}
              compact
            />
          }
          onStartReflection={() => {
            void startReflection();
          }}
          onOpenTree={() => updateLocalWorkspace((current) => ({ ...current, view: "tree" }))}
          onOpenTributeDemo={() => openTributeDemo()}
          onOpenThreadSwitcher={() => setThreadSwitcherOpen(true)}
          onCardPress={handleCardPress}
          onOpenRecentThread={openThread}
        />
      ) : (
        <div className={`min-h-screen ${currentWorkspace.view === "tree" ? "bg-[#0b1219]" : "bg-[#f6f3ed]"}`}>
          <WorkspaceHeader
            view={currentWorkspace.view === "tree" ? "tree" : "thread"}
            title={currentWorkspace.view === "tree" ? "the living tree" : currentThread?.title ?? "reflection"}
            subtitle={
              currentWorkspace.view === "tree"
                ? "trace source threads, review bridges, and keep the structure system-owned."
                : `${currentThread?.topic ?? "one thread at a time"} ${capabilities.supabase ? "| cloud-ready" : "| local preview"}`
            }
            onChangeView={(view) => updateLocalWorkspace((current) => ({ ...current, view }))}
            onOpenThreadSwitcher={() => setThreadSwitcherOpen(true)}
            onNewThread={() => setThreadSwitcherOpen(true)}
            onGoHome={() => updateLocalWorkspace((current) => ({ ...current, view: "landing" }))}
          />

          <AnimatePresence mode="wait" initial={false}>
            {currentWorkspace.view === "thread" && currentThread ? (
              <motion.div
                key="thread-room"
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
              >
                <ThreadWorkspace
                  thread={currentThread}
                  suggestions={threadSuggestions}
                  draft={currentDraft}
                  isBusy={busy}
                  relatedNodes={relatedNodes}
                  observations={threadObservations}
                  onSuggestion={(value) =>
                    updateLocalWorkspace((current) => ({
                      ...current,
                      drafts: currentThread
                        ? { ...current.drafts, [currentThread.id]: value }
                        : current.drafts,
                    }))
                  }
                  onDraftChange={(value) =>
                    updateLocalWorkspace((current) => ({
                      ...current,
                      drafts: currentThread
                        ? { ...current.drafts, [currentThread.id]: value }
                        : current.drafts,
                    }))
                  }
                  onSend={() => {
                    void sendThreadMessage();
                  }}
                  onOpenTree={() => updateLocalWorkspace((current) => ({ ...current, view: "tree" }))}
                  onFocusNode={(nodeId) =>
                    updateLocalWorkspace((current) => ({
                      ...current,
                      view: "tree",
                      selectedNodeId: nodeId,
                    }))
                  }
                  onOpenThreadSettings={() => setThreadSettingsOpen(true)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="tree-room"
                initial={{ opacity: 0, x: -32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 32 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
              >
                <TreeWorkspace
                  nodes={treeNodes}
                  edges={treeEdges}
                  threads={treeThreads}
                  camera={currentWorkspace.treeCamera}
                  editable={showingPersonalTree}
                  selectedNode={selectedNode}
                  selectedNodeSourceThreads={selectedNodeSourceThreads}
                  selectedNodeBridgeEdges={selectedNodeBridgeEdges}
                  mergeTargets={mergeTargets}
                  onCameraChange={(camera) => updateLocalWorkspace((current) => ({ ...current, treeCamera: camera }))}
                  onSelectNode={(nodeId) =>
                    updateLocalWorkspace((current) => ({
                      ...current,
                      selectedNodeId: nodeId,
                    }))
                  }
                  onOpenThread={openThread}
                  onStartThreadFromNode={() => {
                    if (!selectedNode) return;
                    void createStarterThread("tree-prompted", selectedNode.id);
                  }}
                  onPatchNode={(payload) => {
                    void patchSelectedNode(payload);
                  }}
                  onReviewEdge={(edgeId, decision) => {
                    void reviewEdge(edgeId, decision);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <ThreadSwitcherModal
        isOpen={threadSwitcherOpen}
        threads={currentWorkspace.threads}
        activeThreadId={currentWorkspace.activeThreadId}
        onClose={() => setThreadSwitcherOpen(false)}
        onSelectThread={openThread}
        onCreateThread={(payload) => {
          void createThread(payload);
        }}
        onToggleArchive={(threadId, archived) => {
          void performWorkspaceRequest(`/api/threads/${threadId}`, {
            method: "PATCH",
            body: JSON.stringify({ state: currentWorkspace, archived }),
          });
        }}
      />

      <ThreadSettingsModal
        thread={currentThread}
        isOpen={threadSettingsOpen}
        onClose={() => setThreadSettingsOpen(false)}
        onSave={(payload) => {
          void updateThread(payload);
          setThreadSettingsOpen(false);
        }}
        onToggleArchive={(archived) => {
          void updateThread({ archived });
          setThreadSettingsOpen(false);
        }}
      />

      {!capabilities.supabase && currentWorkspace.view !== "landing" && (
        <div className="pointer-events-none fixed bottom-4 left-4 z-50 max-w-sm sm:bottom-6 sm:left-6">
          <Card className="border border-black/5 bg-white/88 shadow-[0_20px_50px_rgba(32,24,18,0.08)]">
            <CardBody className="gap-3 px-4 py-4 text-sm leading-7 text-black/58">
              <p className="font-[family-name:var(--font-instrument-serif)] text-[1.35rem] leading-none text-[#171411]">local preview is active</p>
              <p>threads and tree state are saving in this browser for now. cloud sync turns on when supabase keys are added.</p>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
