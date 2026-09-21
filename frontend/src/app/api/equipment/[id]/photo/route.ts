import { getBearerToken } from "@/features/auth/server/bearer";
import { apiEndpoints, actionPath } from "@/lib/api/endpoints";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = getBearerToken(request);
  if (!access) return Response.json({ detail: "Authentication required." }, { status: 401 });
  const baseUrl = process.env.API_BASE_URL;
  if (!baseUrl) return Response.json({ detail: "The API is unavailable." }, { status: 502 });
  const response = await fetch(`${baseUrl.replace(/\/+$/, "")}${actionPath(apiEndpoints.equipment, (await params).id, "photo")}`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${access}` },
  });
  if (!response.ok) return Response.json({ detail: "Equipment photo could not be loaded." }, { status: response.status });
  return new Response(response.body, {
    status: 200,
    headers: { "Content-Type": response.headers.get("Content-Type") ?? "application/octet-stream" },
  });
}
