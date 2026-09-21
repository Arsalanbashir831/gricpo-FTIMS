import { apiEndpoints } from "@/lib/api/endpoints";
import { apiErrorResponse, apiRequest } from "@/lib/api/server";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ detail: "A JSON request body is required." }, { status: 400 });
  }
  try {
    const result = await apiRequest<unknown>(apiEndpoints.auth.signup, {
      method: "POST", body: JSON.stringify(body),
    });
    return Response.json(result, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
