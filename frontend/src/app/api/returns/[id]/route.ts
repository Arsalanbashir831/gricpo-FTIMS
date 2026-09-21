import type { EquipmentReturn } from "@/features/movements/types";
import { movementProxy } from "@/features/movements/server/proxy";
import { apiEndpoints, detailPath } from "@/lib/api/endpoints";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return movementProxy<EquipmentReturn>(request, detailPath(apiEndpoints.returns, id));
}
