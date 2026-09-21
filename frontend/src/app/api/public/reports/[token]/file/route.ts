export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const baseUrl = process.env.API_BASE_URL; if (!baseUrl) return new Response("Unavailable", { status: 502 });
  const token = (await params).token; const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/public/reports/${encodeURIComponent(token)}/file/`, { cache: "no-store" });
  if (!response.ok) return new Response("Report not found", { status: response.status });
  return new Response(response.body, { headers: { "Content-Type": "application/pdf", "Content-Disposition": "inline" } });
}
