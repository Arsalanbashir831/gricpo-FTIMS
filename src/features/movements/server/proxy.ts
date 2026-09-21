import "server-only";
import { bearerApiRequest } from "@/features/auth/server/bearer";
import { apiErrorResponse } from "@/lib/api/server";

export async function movementProxy<T>(request: Request, path: string, init: RequestInit = {}) {
  try {
    const result = await bearerApiRequest<T>(request, path, init);
    if (result === undefined) return new Response(null, { status: 204 });
    return Response.json(result, { status: init.method === "POST" ? 201 : 200 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
