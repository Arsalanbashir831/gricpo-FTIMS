import { getBearerToken } from "@/features/auth/server/bearer";
import { apiEndpoints } from "@/lib/api/endpoints";
import { apiErrorResponse, apiRequest } from "@/lib/api/server";

export async function POST(request: Request) {
  const token = getBearerToken(request);
  if (!token) return Response.json({ detail: "Authentication required." }, { status: 401 });
  try {
    await apiRequest<unknown>(apiEndpoints.auth.verify, {
      method: "POST", body: JSON.stringify({ token }),
    });
    return Response.json({ valid: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
