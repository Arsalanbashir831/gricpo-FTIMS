import { bearerApiRequest } from "@/features/auth/server/bearer";
import type { TechnicianPage } from "@/features/technicians/types";
import { apiEndpoints } from "@/lib/api/endpoints";
import { apiErrorResponse } from "@/lib/api/server";

export async function GET(request: Request) {
  try {
    const query = new URL(request.url).search;
    const data = await bearerApiRequest<TechnicianPage>(request, `${apiEndpoints.technicians}${query}`);
    return Response.json(data);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
