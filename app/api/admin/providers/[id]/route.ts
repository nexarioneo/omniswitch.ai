import { NextRequest, NextResponse } from "next/server";
import { getProviderById, listProviderKeys } from "@/features/data/providers";
import { requireAdmin } from "@/features/data/sessions";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const providerId = Number(id);
  if (!Number.isInteger(providerId)) {
    return NextResponse.json({ error: "Invalid provider id" }, { status: 400 });
  }

  const provider = getProviderById(providerId);
  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  return NextResponse.json({
    data: { ...provider, keys: listProviderKeys(providerId) },
  });
}
