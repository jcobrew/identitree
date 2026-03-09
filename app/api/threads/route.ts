import { NextResponse } from "next/server";
import { threadCreateRequestSchema } from "@/lib/identitree/types";
import { createThreadInWorkspace } from "@/lib/identitree/workspace";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = threadCreateRequestSchema.parse(json);
  const result = createThreadInWorkspace({
    workspaceInput: parsed.state,
    title: parsed.title,
    topic: parsed.topic,
    kind: parsed.kind,
    starter: parsed.starter,
    linkedNodeId: parsed.linkedNodeId,
  });

  return NextResponse.json(result);
}
