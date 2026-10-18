import { NextResponse } from "next/server";
import { listProviders } from "@/features/data/providers";
export const dynamic = "force-dynamic";


export async function GET() {
  const providers = listProviders();

  const data = providers.map((p) => ({
    name: p.name,
    status: p.is_active ? "active" : "inactive",
  }));

  return NextResponse.json({ status: "ok", providers: data });
}
