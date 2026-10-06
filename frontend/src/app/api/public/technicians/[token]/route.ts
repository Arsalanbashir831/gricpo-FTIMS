import type { PublicTechnician } from "@/features/technicians/types";
import { apiEndpoints } from "@/lib/api/endpoints";
import { apiErrorResponse, apiRequest } from "@/lib/api/server";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const technician = await apiRequest<PublicTechnician>(apiEndpoints.publicTechnician((await params).token));
    return Response.json(technician);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
