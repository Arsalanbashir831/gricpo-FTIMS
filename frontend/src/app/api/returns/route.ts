import type { EquipmentReturn, Page } from "@/features/movements/types";
import { movementProxy } from "@/features/movements/server/proxy";
import { apiEndpoints } from "@/lib/api/endpoints";

export function GET(request: Request) {
  return movementProxy<Page<EquipmentReturn>>(request, `${apiEndpoints.returns}${new URL(request.url).search}`);
}

export async function POST(request: Request) {
  return movementProxy<EquipmentReturn>(request, apiEndpoints.returns, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await request.json()),
  });
}
