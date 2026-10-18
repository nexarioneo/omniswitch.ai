import { NextRequest, NextResponse } from "next/server";
import { listModels, updateModel } from "@/features/data/models";
import { updateModelSchema } from "@/lib/validate";
import { requireAdmin } from "@/features/data/sessions";
export const dynamic = "force-dynamic";


export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const models = listModels();
  return NextResponse.json({ data: models });
}

export async function PUT(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateModelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  updateModel(parseInt(id), parsed.data.is_enabled ? 1 : 0);
  return NextResponse.json({ success: true });
}
