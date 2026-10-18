import { NextRequest, NextResponse } from "next/server";
import { addProviderKey, getProviderById } from "@/features/data/providers";
import { addProviderKeySchema } from "@/lib/validate";
import { requireAdmin } from "@/features/data/sessions";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const providerId = parseInt(id, 10);

  if (!getProviderById(providerId)) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = addProviderKeySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const key = addProviderKey(providerId, parsed.data.key, parsed.data.rotation_strategy ?? "round_robin");
  return NextResponse.json({ data: key }, { status: 201 });
}
