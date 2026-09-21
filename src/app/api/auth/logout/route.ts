import { getBearerToken } from "@/features/auth/server/bearer";
import { apiEndpoints } from "@/lib/api/endpoints";
import { apiRequest } from "@/lib/api/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { refresh?: string } | null;
  const refresh = body?.refresh;
  const access = getBearerToken(request);
  if (refresh && access) {
    try {
      await apiRequest<void>(apiEndpoints.auth.logout, {
        method: "POST",
        headers: { Authorization: `Bearer ${access}` },
        body: JSON.stringify({ refresh }),
      });
    } catch {
      // Clear the browser session even if the backend token has expired.
    }
  }
  return new Response(null, { status: 204 });
}
