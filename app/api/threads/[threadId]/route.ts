import { NextResponse } from "next/server";
import { threadUpdateRequestSchema } from "@/lib/identitree/types";
import { updateThreadInWorkspace } from "@/lib/identitree/workspace";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const { threadId } = await params;
  const json = await request.json();
  const parsed = threadUpdateRequestSchema.parse(json);
  const result = updateThreadInWorkspace({
    workspaceInput: parsed.state,
    threadId,
    title: parsed.title,
    topic: parsed.topic,
    archived: parsed.archived,
  });

  return NextResponse.json(result);
}
