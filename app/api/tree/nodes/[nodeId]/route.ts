import { NextResponse } from "next/server";
import { nodePatchRequestSchema } from "@/lib/identitree/types";
import { patchNodeInWorkspace } from "@/lib/identitree/workspace";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ nodeId: string }> },
) {
  const { nodeId } = await params;
  const json = await request.json();
  const parsed = nodePatchRequestSchema.parse(json);
  const result = patchNodeInWorkspace({
    workspaceInput: parsed.state,
    nodeId,
    label: parsed.label,
    insight: parsed.insight,
    archived: parsed.archived,
    mergeIntoId: parsed.mergeIntoId,
  });

  return NextResponse.json(result);
}
