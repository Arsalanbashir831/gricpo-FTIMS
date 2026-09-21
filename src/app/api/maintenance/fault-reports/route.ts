import type { ApiPage, FaultReport } from "@/features/maintenance/types";
import { maintenanceProxy } from "@/features/maintenance/server/proxy";
import { apiEndpoints } from "@/lib/api/endpoints";

export function GET(request: Request) { return maintenanceProxy<ApiPage<FaultReport>>(request, `${apiEndpoints.faultReports}${new URL(request.url).search}`); }
export async function POST(request: Request) { return maintenanceProxy<FaultReport>(request, apiEndpoints.faultReports, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(await request.json()) }); }
