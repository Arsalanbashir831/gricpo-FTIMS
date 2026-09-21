import type { Equipment, EquipmentPage } from "@/features/equipment/types";
import { equipmentProxy } from "@/features/equipment/server/proxy";
import { apiEndpoints } from "@/lib/api/endpoints";

export async function GET(request: Request) {
  const query = new URL(request.url).search;
  return equipmentProxy<EquipmentPage>(request, `${apiEndpoints.equipment}${query}`);
}

export async function POST(request: Request) {
  const body = await request.formData();
  return equipmentProxy<Equipment>(request, apiEndpoints.equipment, { method: "POST", body });
}
