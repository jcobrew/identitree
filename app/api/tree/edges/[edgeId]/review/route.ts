import { NextResponse } from "next/server";
import { edgeReviewRequestSchema } from "@/lib/identitree/types";
import { reviewEdgeInWorkspace } from "@/lib/identitree/workspace";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ edgeId: string }> },
) {
  const { edgeId } = await params;
  const json = await request.json();
  const parsed = edgeReviewRequestSchema.parse(json);
  const result = reviewEdgeInWorkspace({
    workspaceInput: parsed.state,
    edgeId,
    decision: parsed.decision,
  });

  return NextResponse.json(result);
}
