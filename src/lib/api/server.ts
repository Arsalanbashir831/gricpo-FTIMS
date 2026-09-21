import "server-only";

export class ApiError extends Error {
  constructor(public status: number, public payload: unknown) {
    super(getApiErrorMessage(payload));
  }
}

function getApiErrorMessage(payload: unknown): string {
  if (payload && typeof payload === "object") {
    const data = payload as Record<string, unknown>;
    if (typeof data.detail === "string") return data.detail;
    const first = Object.values(data)[0];
    if (Array.isArray(first) && typeof first[0] === "string") return first[0];
  }
  return "The request could not be completed.";
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const baseUrl = process.env.API_BASE_URL;
  if (!baseUrl) throw new Error("API_BASE_URL is not configured.");

  const hasFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  const headers = new Headers(init.headers);
  if (!hasFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${baseUrl.replace(/\/+$/, "")}${path}`, {
    ...init,
    cache: "no-store",
    headers,
  });
  if (response.status === 204) return undefined as T;
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(response.status, payload);
  return payload as T;
}

export function apiErrorResponse(error: unknown): Response {
  if (error instanceof ApiError) {
    const body = error.payload && typeof error.payload === "object"
      ? error.payload
      : { detail: error.message || "An unexpected error occurred." };
    return Response.json(body, { status: error.status });
  }
  return Response.json({ detail: "The API is unavailable." }, { status: 502 });
}
