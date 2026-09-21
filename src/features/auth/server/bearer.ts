import "server-only";

import { ApiError, apiRequest } from "@/lib/api/server";

export function getBearerToken(request: Request) {
  const authorization = request.headers.get("Authorization");
  return authorization?.startsWith("Bearer ") ? authorization.slice(7).trim() : null;
}

export async function bearerApiRequest<T>(request: Request, path: string, init: RequestInit = {}) {
  const access = getBearerToken(request);
  if (!access) throw new ApiError(401, { detail: "Authentication required." });

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${access}`);
  return apiRequest<T>(path, { ...init, headers });
}
