import { NextResponse } from "next/server";
import { threadMessageRequestSchema } from "@/lib/identitree/types";
import { sendThreadMessageInWorkspace } from "@/lib/identitree/workspace";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const { threadId } = await params;
  const json = await request.json();
  const parsed = threadMessageRequestSchema.parse(json);
  const result = await sendThreadMessageInWorkspace({
    workspaceInput: parsed.state,
    threadId,
    message: parsed.message,
  });

  return NextResponse.json(result);
}
