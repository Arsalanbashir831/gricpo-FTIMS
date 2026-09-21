import { reportProxy } from "@/features/reports/server/proxy";
import { apiEndpoints } from "@/lib/api/endpoints";
export function GET(request: Request, { params }: { params: Promise<{ kind: string }> }) { return params.then(({ kind }) => reportProxy(request, `${apiEndpoints.masterData(kind)}${new URL(request.url).search}`)); }
export async function POST(request: Request, { params }: { params: Promise<{ kind: string }> }) { return reportProxy(request, apiEndpoints.masterData((await params).kind), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(await request.json()) }); }
