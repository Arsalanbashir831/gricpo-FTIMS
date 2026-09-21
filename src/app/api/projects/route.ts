import type { ProjectSite, ProjectSitePage } from "@/features/projects/types";
import { projectProxy } from "@/features/projects/server/proxy";
import { apiEndpoints } from "@/lib/api/endpoints";

export async function GET(request: Request) {
  return projectProxy<ProjectSitePage>(request, `${apiEndpoints.projectSites}${new URL(request.url).search}`);
}

export async function POST(request: Request) {
  return projectProxy<ProjectSite>(request, apiEndpoints.projectSites, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await request.json()),
  });
}
