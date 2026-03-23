import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, supabaseAdmin } from "@/lib/supabase";
import { CloudVault } from "@/lib/vault";
import { executeWithVault } from "@/lib/executor";
import { hasSliceHeaders, verifySliceRequest } from "@/lib/slice";

export async function POST(req: NextRequest) {
  // ERC-8128: if the request carries Slice auth headers, verify them.
  // Agents authenticate via wallet signature instead of Supabase session.
  let sliceAddress: string | null = null;
  if (hasSliceHeaders(req)) {
    sliceAddress = await verifySliceRequest(req);
    if (!sliceAddress) {
      return NextResponse.json({ error: "ERC-8128 signature verification failed" }, { status: 401 });
    }
  }

  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { service, action, params } = await req.json();
  if (!service || !action) return NextResponse.json({ error: "service and action required" }, { status: 400 });
  const vault = new CloudVault(userId);
  const result = await executeWithVault(vault, service, action, params ?? {});
  // Persist audit log — include signer address when request came via ERC-8128
  await supabaseAdmin.from("audit_logs").insert({
    user_id: userId,
    service,
    action,
    success: result.success,
    ...(sliceAddress ? { signer: sliceAddress } : {}),
  });
  return NextResponse.json(result);
}
