import { NextRequest, NextResponse } from "next/server";
import { createApiKey, listApiKeys, deleteApiKey } from "@/features/data/api-keys";
import { createApiKeySchema } from "@/lib/validate";
import { requireAdmin } from "@/features/data/sessions";
export const dynamic = "force-dynamic";


export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const keys = listApiKeys();
  return NextResponse.json({ data: keys });
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createApiKeySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { key, plaintextKey } = createApiKey(
    parsed.data.name,
    parsed.data.rate_limit_type || "token",
    parsed.data.rate_limit_value || null,
    parsed.data.rate_limit_window || 86400
  );

  return NextResponse.json({ data: key, key: plaintextKey }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  deleteApiKey(parseInt(id));
  return NextResponse.json({ success: true });
}
