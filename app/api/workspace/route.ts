import { NextResponse } from "next/server";
import { getWorkspacePayload } from "@/lib/identitree/workspace";

export async function GET() {
  return NextResponse.json(getWorkspacePayload());
}
