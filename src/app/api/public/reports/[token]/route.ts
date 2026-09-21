import { apiEndpoints } from "@/lib/api/endpoints";
import { apiErrorResponse, apiRequest } from "@/lib/api/server";
import type { TechnicianReport } from "@/features/reports/types";
export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) { try { return Response.json(await apiRequest<TechnicianReport>(apiEndpoints.publicReport((await params).token))); } catch (error) { return apiErrorResponse(error); } }
