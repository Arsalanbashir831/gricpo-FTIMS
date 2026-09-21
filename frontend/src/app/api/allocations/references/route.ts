import type { Accessory, AllocationReferences } from "@/features/allocations/types";
import type { EquipmentPage } from "@/features/equipment/types";
import type { ProjectSitePage } from "@/features/projects/types";
import type { TechnicianPage } from "@/features/technicians/types";
import { allocationProxy } from "@/features/allocations/server/proxy";
import { apiEndpoints } from "@/lib/api/endpoints";

export async function GET(request: Request) {
  const responses = await Promise.all([
    allocationProxy<EquipmentPage>(request, `${apiEndpoints.equipment}?page_size=100&ordering=equipment_number`),
    allocationProxy<TechnicianPage>(request, `${apiEndpoints.technicians}?page_size=100&status=approved`),
    allocationProxy<ProjectSitePage>(request, `${apiEndpoints.projectSites}?page_size=100&status=active`),
    allocationProxy<{ count: number; results: Accessory[] }>(request, `${apiEndpoints.accessories}?page_size=100`),
  ]);
  const failed = responses.find((response) => !response.ok); if (failed) return failed;
  const [equipment, technicians, projects, accessories] = await Promise.all(responses.map((response) => response.json()));
  const result: AllocationReferences = {
    equipment: (equipment as EquipmentPage).results,
    technicians: (technicians as TechnicianPage).results,
    projects: (projects as ProjectSitePage).results.map(({ id, name, client_name, location }) => ({ id, name, client_name, location })),
    accessories: (accessories as { results: Accessory[] }).results,
  };
  return Response.json(result);
}
