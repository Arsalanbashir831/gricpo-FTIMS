import type { EquipmentSummary } from "@/features/equipment/types";
import { equipmentProxy } from "@/features/equipment/server/proxy";
import { apiEndpoints } from "@/lib/api/endpoints";

export async function GET(request: Request) {
  const query = new URL(request.url).search;
  return equipmentProxy<EquipmentSummary>(request, `${apiEndpoints.equipmentSummary}${query}`);
}
