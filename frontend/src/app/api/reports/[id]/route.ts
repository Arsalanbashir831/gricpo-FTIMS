import type { TechnicianReport } from "@/features/reports/types";
import { reportProxy } from "@/features/reports/server/proxy";
import { apiEndpoints, detailPath } from "@/lib/api/endpoints";
interface Context { params: Promise<{ id: string }> }
export async function GET(request: Request, { params }: Context) { return reportProxy<TechnicianReport>(request, detailPath(apiEndpoints.reports, (await params).id)); }
export async function PATCH(request: Request, { params }: Context) { return reportProxy<TechnicianReport>(request, detailPath(apiEndpoints.reports, (await params).id), { method: "PATCH", body: await request.formData() }); }
export async function DELETE(request: Request, { params }: Context) { return reportProxy<void>(request, detailPath(apiEndpoints.reports, (await params).id), { method: "DELETE" }); }
