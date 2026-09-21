import type { EquipmentPage } from "@/features/equipment/types";
import type { ApiPage, MaintenanceReferences, MaintenanceRequest, ReferenceOption } from "@/features/maintenance/types";
import { maintenanceProxy } from "@/features/maintenance/server/proxy";
import { apiEndpoints } from "@/lib/api/endpoints";

export async function GET(request: Request) {
  const calls = await Promise.all([
    maintenanceProxy<EquipmentPage>(request, `${apiEndpoints.equipment}?page_size=100&ordering=equipment_number`),
    maintenanceProxy<{ results: ReferenceOption[] }>(request, apiEndpoints.masterData("maintenance-priorities")),
    maintenanceProxy<{ results: ReferenceOption[] }>(request, apiEndpoints.masterData("maintenance-statuses")),
    maintenanceProxy<{ results: ReferenceOption[] }>(request, apiEndpoints.masterData("fault-statuses")),
    maintenanceProxy<{ results: ReferenceOption[] }>(request, apiEndpoints.masterData("service-types")),
    maintenanceProxy<{ results: ReferenceOption[] }>(request, apiEndpoints.masterData("service-results")),
    maintenanceProxy<ApiPage<MaintenanceRequest>>(request, `${apiEndpoints.maintenance}?page_size=100`),
  ]);
  const failed = calls.find((response) => !response.ok);
  if (failed) return failed;
  const [equipment, priorities, maintenanceStatuses, faultStatuses, serviceTypes, serviceResults, requests] = await Promise.all(calls.map((response) => response.json()));
  const result: MaintenanceReferences = {
    equipment: (equipment as EquipmentPage).results.map(({ id, equipment_number, description }) => ({ id, equipment_number, description })),
    priorities: (priorities as { results: ReferenceOption[] }).results,
    maintenanceStatuses: (maintenanceStatuses as { results: ReferenceOption[] }).results,
    faultStatuses: (faultStatuses as { results: ReferenceOption[] }).results,
    serviceTypes: (serviceTypes as { results: ReferenceOption[] }).results,
    serviceResults: (serviceResults as { results: ReferenceOption[] }).results,
    maintenanceRequests: (requests as ApiPage<MaintenanceRequest>).results.map(({ id, request_number, equipment: equipmentId }) => ({ id, request_number, equipment: equipmentId })),
  };
  return Response.json(result);
}
