import { getBearerToken } from "@/features/auth/server/bearer";
import { actionPath, apiEndpoints } from "@/lib/api/endpoints";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = getBearerToken(request);
  const baseUrl = process.env.API_BASE_URL;
  if (!access) return Response.json({ detail: "Authentication required." }, { status: 401 });
  if (!baseUrl) return Response.json({ detail: "The API is unavailable." }, { status: 502 });
  const response = await fetch(`${baseUrl.replace(/\/+$/, "")}${actionPath(apiEndpoints.calibrations, (await params).id, "file")}`, {
    cache: "no-store", headers: { Authorization: `Bearer ${access}` },
  });
  if (!response.ok) return Response.json({ detail: "Certificate could not be loaded." }, { status: response.status });
  return new Response(response.body, { headers: {
    "Content-Type": response.headers.get("Content-Type") ?? "application/pdf",
    "Content-Disposition": response.headers.get("Content-Disposition") ?? "attachment",
  }});
}
