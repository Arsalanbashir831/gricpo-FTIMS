import type { ClientReference, ProjectStatusReference } from "@/features/projects/types";
import { projectProxy } from "@/features/projects/server/proxy";
import { apiEndpoints } from "@/lib/api/endpoints";

export async function GET(request: Request) {
  const [clientsRes, statusesRes] = await Promise.all([
    projectProxy<{ results: ClientReference[] }>(request, `${apiEndpoints.clients}?page_size=100`),
    projectProxy<{ results: ProjectStatusReference[] }>(request, apiEndpoints.masterData("project-statuses")),
  ]);

  const clients = clientsRes.ok ? ((await clientsRes.json()).results as ClientReference[]) : [];
  const statuses = statusesRes.ok ? ((await statusesRes.json()).results as ProjectStatusReference[]) : [];

  return Response.json({ clients, statuses });
}
