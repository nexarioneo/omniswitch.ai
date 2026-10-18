import { NextResponse } from "next/server";
import { listUsageLogs, getUsageStats } from "@/features/data/usage";
import { requireAdmin } from "@/features/data/sessions";
export const dynamic = "force-dynamic";


export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const stats = getUsageStats();
  const logs = listUsageLogs(100);
  return NextResponse.json({ stats, data: logs });
}
