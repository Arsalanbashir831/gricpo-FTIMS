import { bearerApiRequest } from "@/features/auth/server/bearer";
import type { Administrator } from "@/features/auth/types";
import { apiEndpoints } from "@/lib/api/endpoints";
import { apiErrorResponse } from "@/lib/api/server";

export async function GET(request: Request) {
  try {
    const result = await bearerApiRequest<{ results: Administrator[] }>(request, apiEndpoints.administrators);
    return Response.json(result);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
