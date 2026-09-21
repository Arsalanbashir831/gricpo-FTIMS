import type { CalibrationEquipmentOption, SiteReferenceOption } from "@/features/calibration/types";
import type { EquipmentPage, EquipmentReference } from "@/features/equipment/types";
import { calibrationProxy } from "@/features/calibration/server/proxy";
import { apiEndpoints } from "@/lib/api/endpoints";

export async function GET(request: Request) {
  const [equipmentResponse, categoryResponse, sitesResponse] = await Promise.all([
    calibrationProxy<EquipmentPage>(request, `${apiEndpoints.equipment}?page_size=100&ordering=equipment_number`),
    calibrationProxy<{ results: EquipmentReference[] }>(request, apiEndpoints.masterData("equipment-categories")),
    calibrationProxy<{ results: SiteReferenceOption[] }>(request, `${apiEndpoints.projectSites}?page_size=100`),
  ]);

  if (!equipmentResponse.ok) return equipmentResponse;
  if (!categoryResponse.ok) return categoryResponse;
  
  const equipmentPage = await equipmentResponse.json() as EquipmentPage;
  const categories = (await categoryResponse.json()).results as EquipmentReference[];
  const sites = sitesResponse.ok ? ((await sitesResponse.json()).results as SiteReferenceOption[]) : [];

  const equipment = equipmentPage.results.map((item): CalibrationEquipmentOption => ({
    id: item.id, equipment_number: item.equipment_number, description: item.description, category_name: item.category_name,
  }));
  return Response.json({ equipment, categories, sites });
}

