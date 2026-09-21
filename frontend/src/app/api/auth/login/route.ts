import type { LoginPayload, LoginResponse } from "@/features/auth/types";
import { apiEndpoints } from "@/lib/api/endpoints";
import { apiErrorResponse, apiRequest } from "@/lib/api/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as LoginPayload | null;
  if (!body?.username || !body.password) {
    return Response.json({ detail: "Username and password are required." }, { status: 400 });
  }
  try {
    const data = await apiRequest<LoginResponse>(apiEndpoints.auth.login, {
      method: "POST", body: JSON.stringify(body),
    });
    const store = await cookies();
    store.delete("gripco_access");
    store.delete("gripco_refresh");
    return Response.json({ user: data.user, access: data.access, refresh: data.refresh });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
