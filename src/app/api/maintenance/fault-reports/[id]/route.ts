import type { FaultReport } from "@/features/maintenance/types";
import { maintenanceProxy } from "@/features/maintenance/server/proxy";
import { apiEndpoints, detailPath } from "@/lib/api/endpoints";

interface Context { params: Promise<{ id: string }> }
async function proxyDetail(request: Request, { params }: Context, init: RequestInit = {}) { return maintenanceProxy<FaultReport>(request, detailPath(apiEndpoints.faultReports, (await params).id), init); }
export function GET(request: Request, context: Context) { return proxyDetail(request, context); }
export async function PATCH(request: Request, context: Context) { return proxyDetail(request, context, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(await request.json()) }); }
export function DELETE(request: Request, context: Context) { return proxyDetail(request, context, { method: "DELETE" }); }
