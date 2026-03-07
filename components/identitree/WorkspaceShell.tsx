"use client";

import type { ReactNode } from "react";

type WorkspaceShellProps = {
  brand: ReactNode;
  center?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
};

export function WorkspaceShell({ brand, center, actions, children }: WorkspaceShellProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_50%_14%,rgba(88,63,39,0.18),transparent_34%),linear-gradient(180deg,#f4ecdf_0%,#e8dbc7_100%)] font-[family-name:var(--font-manrope)] text-zinc-900">
      <header className="sticky top-0 z-30 border-b border-zinc-800/10 bg-[#f6efe3]/88 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0 flex-1">{brand}</div>
          <div className="hidden justify-center lg:flex lg:flex-1">{center}</div>
          <div className="flex min-w-0 flex-1 justify-end">{actions}</div>
        </div>
        {center && <div className="border-t border-zinc-800/8 px-4 py-2 lg:hidden">{center}</div>}
      </header>
      <main className="min-h-0 flex-1">{children}</main>
    </div>
  );
}
