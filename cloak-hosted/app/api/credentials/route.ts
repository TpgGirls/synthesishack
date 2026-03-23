import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/supabase";
import { CloudVault } from "@/lib/vault";
import { hasSliceHeaders, verifySliceRequest } from "@/lib/slice";

export async function POST(req: NextRequest) {
  if (hasSliceHeaders(req)) {
    const addr = await verifySliceRequest(req);
    if (!addr) return NextResponse.json({ error: "ERC-8128 signature verification failed" }, { status: 401 });
  }

  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { service, credential } = await req.json();
  if (!service || !credential) return NextResponse.json({ error: "service and credential required" }, { status: 400 });
  const vault = new CloudVault(userId);
  await vault.store(service, credential);
  return NextResponse.json({ message: `Credential for "${service}" stored successfully.` });
}
