import { createSeededWorkspace, WORKSPACE_STORAGE_KEY } from "@/lib/identitree/seed";
import type { WorkspaceState } from "@/lib/identitree/types";
import { coerceWorkspaceState } from "@/lib/identitree/state";

export const readWorkspaceFromStorage = (): WorkspaceState => {
  if (typeof window === "undefined") return createSeededWorkspace();

  const raw = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
  if (!raw) return createSeededWorkspace();

  try {
    return coerceWorkspaceState(JSON.parse(raw));
  } catch {
    return createSeededWorkspace();
  }
};

export const writeWorkspaceToStorage = (workspace: WorkspaceState) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(workspace));
};
