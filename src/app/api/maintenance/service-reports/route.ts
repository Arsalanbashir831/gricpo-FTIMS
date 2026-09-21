import type { ApiPage, ServiceReport } from "@/features/maintenance/types";
import { maintenanceProxy } from "@/features/maintenance/server/proxy";
import { apiEndpoints } from "@/lib/api/endpoints";

export function GET(request: Request) { return maintenanceProxy<ApiPage<ServiceReport>>(request, `${apiEndpoints.services}${new URL(request.url).search}`); }
export async function POST(request: Request) { return maintenanceProxy<ServiceReport>(request, apiEndpoints.services, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(await request.json()) }); }
