import type { EquipmentReference } from "@/features/equipment/types";
import { equipmentProxy } from "@/features/equipment/server/proxy";
import { apiEndpoints } from "@/lib/api/endpoints";

export async function GET(request: Request) {
  const [categories, statuses] = await Promise.all([
    equipmentProxy<{ results: EquipmentReference[] }>(request, apiEndpoints.masterData("equipment-categories")),
    equipmentProxy<{ results: EquipmentReference[] }>(request, apiEndpoints.masterData("equipment-statuses")),
  ]);
  if (!categories.ok) return categories;
  if (!statuses.ok) return statuses;
  return Response.json({
    categories: (await categories.json()).results,
    statuses: (await statuses.json()).results,
  });
}
