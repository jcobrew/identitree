"use client";

import { Card, CardBody, Spinner } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { LandingView } from "@/components/identitree/LandingView";
import { ThreadSwitcherModal } from "@/components/identitree/ThreadSwitcherModal";
import { ThreadSettingsModal } from "@/components/identitree/ThreadSettingsModal";
import { ThreadWorkspace } from "@/components/identitree/ThreadWorkspace";
import { TreeMap } from "@/components/identitree/TreeMap";
import { TreeWorkspace } from "@/components/identitree/TreeWorkspace";
import { WorkspaceHeader } from "@/components/identitree/WorkspaceHeader";
import {
  DEMO_WORKSPACE,
  FIRST_TIME_CARDS,
  ONBOARDING_COPY,
  SAMPLE_THREADS,
  SAMPLE_INSIGHTS,
  SAMPLE_TREE_EDGES,
  SAMPLE_TREE_NODES,
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
  const currentThread =
    currentWorkspace.threads.find((thread) => thread.id === currentWorkspace.activeThreadId) ??
    currentWorkspace.threads[0] ??
    null;

  const liveTree = currentWorkspace.hasCompletedOnboarding;
  const treeNodes = liveTree ? currentWorkspace.tree.nodes : SAMPLE_TREE_NODES;
  const treeEdges = liveTree ? currentWorkspace.tree.edges : SAMPLE_TREE_EDGES;
  const treeThreads = liveTree ? currentWorkspace.threads : SAMPLE_THREADS;

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
    if (!selectedNode || !liveTree) return;
    await performWorkspaceRequest(`/api/tree/nodes/${selectedNode.id}`, {
      method: "PATCH",
      body: JSON.stringify({ state: currentWorkspace, ...payload }),
    });
  };

  const reviewEdge = async (edgeId: string, decision: "accept" | "reject") => {
    if (!liveTree) return;
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
        updateLocalWorkspace((current) => ({ ...current, view: "tree" }));
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
      {currentWorkspace.view === "landing" ? (
        <LandingView
          isReturning={hasPersonalProgress}
          cards={landingCards}
          sampleInsights={SAMPLE_INSIGHTS}
          treePreview={
            <TreeMap
              nodes={hasPersonalProgress && liveTree ? treeNodes : SAMPLE_TREE_NODES}
              edges={hasPersonalProgress && liveTree ? treeEdges : SAMPLE_TREE_EDGES}
              threads={hasPersonalProgress && liveTree ? treeThreads : SAMPLE_THREADS}
              selectedNodeId={null}
              camera={previewCamera}
              compact
            />
          }
          onStartReflection={() => {
            void startReflection();
          }}
          onOpenTree={() => updateLocalWorkspace((current) => ({ ...current, view: "tree" }))}
          onOpenThreadSwitcher={() => setThreadSwitcherOpen(true)}
          onCardPress={handleCardPress}
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
                  editable={liveTree}
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
