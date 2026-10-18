import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/features/gateway/auth";
import { listEnabledModels } from "@/features/data/models";
import { getProviderById } from "@/features/data/providers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const apiKey = authenticateRequest(request.headers.get("authorization"));
  if (!apiKey) {
    return NextResponse.json(
      { error: { message: "Invalid or missing API key", type: "invalid_request_error" } },
      { status: 401 }
    );
  }

  const models = listEnabledModels();

  const data = models.map((m) => {
    const provider = getProviderById(m.provider_id);
    return {
      id: m.model_name,
      object: "model",
      created: Math.floor(Date.now() / 1000),
      owned_by: provider?.name || "unknown",
    };
  });

  return NextResponse.json({ object: "list", data });
}
