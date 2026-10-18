import { NextRequest, NextResponse } from "next/server";
import { createProvider, listProviders, deleteProvider, listProviderKeys, getProviderByName } from "@/features/data/providers";
import { createProviderSchema } from "@/lib/validate";
import { requireAdmin } from "@/features/data/sessions";

export const dynamic = "force-dynamic";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const providers = listProviders();
  const data = providers.map((p) => ({
    ...p,
    keys: listProviderKeys(p.id),
  }));
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createProviderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  if (getProviderByName(parsed.data.name)) {
    return NextResponse.json(
      { error: `Provider '${parsed.data.name}' already exists` },
      { status: 409 }
    );
  }

  const provider = createProvider(parsed.data.name, parsed.data.base_url, parsed.data.auth_type ?? "bearer");
  return NextResponse.json({ data: provider }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  deleteProvider(parseInt(id, 10));
  return NextResponse.json({ success: true });
}
