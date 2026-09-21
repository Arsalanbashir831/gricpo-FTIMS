import type { MaintenanceSummary } from "@/features/maintenance/types";
import { maintenanceProxy } from "@/features/maintenance/server/proxy";
import { apiEndpoints } from "@/lib/api/endpoints";

export function GET(request: Request) { return maintenanceProxy<MaintenanceSummary>(request, `${apiEndpoints.maintenance}summary/`); }
