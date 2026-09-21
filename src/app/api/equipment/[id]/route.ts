import type { Equipment } from "@/features/equipment/types";
import { equipmentProxy } from "@/features/equipment/server/proxy";
import { apiEndpoints, detailPath } from "@/lib/api/endpoints";

interface Context { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Context) {
  return equipmentProxy<Equipment>(request, detailPath(apiEndpoints.equipment, (await params).id));
}

export async function PUT(request: Request, { params }: Context) {
  return equipmentProxy<Equipment>(request, detailPath(apiEndpoints.equipment, (await params).id), {
    method: "PUT", body: await request.formData(),
  });
}

export async function PATCH(request: Request, { params }: Context) {
  return equipmentProxy<Equipment>(request, detailPath(apiEndpoints.equipment, (await params).id), {
    method: "PATCH", body: await request.formData(),
  });
}

export async function DELETE(request: Request, { params }: Context) {
  return equipmentProxy<void>(request, detailPath(apiEndpoints.equipment, (await params).id), { method: "DELETE" });
}
