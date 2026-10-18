import { NextRequest, NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/features/data/settings";
import { requireAdmin } from "@/features/data/sessions";
import { settingsSchema } from "@/lib/validate";

export const dynamic = "force-dynamic";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  return NextResponse.json({ data: getSettings() });
}

export async function PUT(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  return NextResponse.json({ data: updateSettings(parsed.data) });
}
