import type { AllocationPage } from "@/features/allocations/types";
import type { MovementReferences } from "@/features/movements/types";
import type { ProjectSitePage } from "@/features/projects/types";
import type { TechnicianPage } from "@/features/technicians/types";
import { movementProxy } from "@/features/movements/server/proxy";
import { apiEndpoints } from "@/lib/api/endpoints";

export async function GET(request: Request) {
  const [allocationsResponse, techniciansResponse, projectsResponse] = await Promise.all([
    movementProxy<AllocationPage>(request, `${apiEndpoints.allocations}?page_size=100`),
    movementProxy<TechnicianPage>(request, `${apiEndpoints.technicians}?page_size=100&status=approved`),
    movementProxy<ProjectSitePage>(request, `${apiEndpoints.projectSites}?page_size=100&status=active`),
  ]);
  const failed = [allocationsResponse, techniciansResponse, projectsResponse].find((response) => !response.ok);
  if (failed) return failed;
  const allocations = await allocationsResponse.json() as AllocationPage;
  const technicians = await techniciansResponse.json() as TechnicianPage;
  const projects = await projectsResponse.json() as ProjectSitePage;
  const result: MovementReferences = {
    allocations: allocations.results,
    technicians: technicians.results,
    projects: projects.results.map(({ id, name, client_name, location }) => ({ id, name, client_name, location })),
  };
  return Response.json(result);
}
