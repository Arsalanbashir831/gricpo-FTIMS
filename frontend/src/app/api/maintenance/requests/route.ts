import type { ApiPage, MaintenanceRequest } from "@/features/maintenance/types";
import { maintenanceProxy } from "@/features/maintenance/server/proxy";
import { apiEndpoints } from "@/lib/api/endpoints";

export function GET(request: Request) {
  return maintenanceProxy<ApiPage<MaintenanceRequest>>(request, `${apiEndpoints.maintenance}${new URL(request.url).search}`);
}
export async function POST(request: Request) {
  return maintenanceProxy<MaintenanceRequest>(request, apiEndpoints.maintenance, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(await request.json()) });
}
