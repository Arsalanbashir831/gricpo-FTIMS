import type { ProjectSite } from "@/features/projects/types";
import { projectProxy } from "@/features/projects/server/proxy";
import { apiEndpoints, detailPath } from "@/lib/api/endpoints";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Context) {
  return projectProxy<ProjectSite>(request, detailPath(apiEndpoints.projectSites, (await params).id));
}

export async function PATCH(request: Request, { params }: Context) {
  return projectProxy<ProjectSite>(request, detailPath(apiEndpoints.projectSites, (await params).id), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await request.json()),
  });
}

export async function PUT(request: Request, { params }: Context) {
  return projectProxy<ProjectSite>(request, detailPath(apiEndpoints.projectSites, (await params).id), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await request.json()),
  });
}

export async function DELETE(request: Request, { params }: Context) {
  return projectProxy<void>(request, detailPath(apiEndpoints.projectSites, (await params).id), {
    method: "DELETE",
  });
}
