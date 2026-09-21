import { actionPath } from "@/lib/api/endpoints";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const baseUrl = process.env.API_BASE_URL;
  if (!baseUrl) return Response.json({ detail: "The API is unavailable." }, { status: 502 });
  const response = await fetch(`${baseUrl.replace(/\/+$/, "")}${actionPath("/public/equipment/", (await params).token, "photo")}`, {
    cache: "no-store",
  });
  if (!response.ok) return Response.json({ detail: "Equipment photo could not be loaded." }, { status: response.status });
  return new Response(response.body, {
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/octet-stream",
      "Cache-Control": "public, max-age=300",
    },
  });
}
