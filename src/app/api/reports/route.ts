import type { ReportPage, TechnicianReport } from "@/features/reports/types";
import { reportProxy } from "@/features/reports/server/proxy";
import { apiEndpoints } from "@/lib/api/endpoints";
export function GET(request: Request) { return reportProxy<ReportPage>(request, `${apiEndpoints.reports}${new URL(request.url).search}`); }
export async function POST(request: Request) { return reportProxy<TechnicianReport>(request, apiEndpoints.reports, { method: "POST", body: await request.formData() }); }
