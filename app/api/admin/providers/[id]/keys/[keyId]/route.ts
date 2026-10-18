import { NextRequest, NextResponse } from "next/server";
import { deleteProviderKey } from "@/features/data/providers";
import { requireAdmin } from "@/features/data/sessions";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ keyId: string }> }
) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { keyId } = await params;
  deleteProviderKey(parseInt(keyId, 10));
  return NextResponse.json({ success: true });
}
