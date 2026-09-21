import type { PublicEquipment } from "@/features/equipment/types";
import { apiEndpoints } from "@/lib/api/endpoints";
import { apiErrorResponse, apiRequest } from "@/lib/api/server";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const equipment = await apiRequest<PublicEquipment>(apiEndpoints.publicEquipment((await params).token));
    return Response.json(equipment);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
