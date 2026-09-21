import type { TechnicianReport } from "@/features/reports/types";
import { reportProxy } from "@/features/reports/server/proxy";
import { actionPath, apiEndpoints } from "@/lib/api/endpoints";
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) { return reportProxy<TechnicianReport>(request, actionPath(apiEndpoints.reports, (await params).id, "review"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(await request.json()) }); }
