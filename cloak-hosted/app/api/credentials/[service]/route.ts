import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/supabase";
import { CloudVault } from "@/lib/vault";
import { hasSliceHeaders, verifySliceRequest } from "@/lib/slice";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ service: string }> }) {
  if (hasSliceHeaders(req)) {
    const addr = await verifySliceRequest(req);
    if (!addr) return NextResponse.json({ error: "ERC-8128 signature verification failed" }, { status: 401 });
  }

  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { service } = await params;
  const vault = new CloudVault(userId);
  await vault.remove(service);
  return NextResponse.json({ message: `Credential for "${service}" removed.` });
}
