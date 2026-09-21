import type { TokenPair } from "@/features/auth/types";
import { apiEndpoints } from "@/lib/api/endpoints";
import { apiErrorResponse, apiRequest } from "@/lib/api/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { refresh?: string } | null;
  if (!body?.refresh) return Response.json({ detail: "Refresh token is required." }, { status: 400 });
  try {
    const tokens = await apiRequest<TokenPair>(apiEndpoints.auth.refresh, {
      method: "POST",
      body: JSON.stringify({ refresh: body.refresh }),
    });
    return Response.json(tokens);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
