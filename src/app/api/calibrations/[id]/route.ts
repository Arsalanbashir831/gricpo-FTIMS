import type { Calibration } from "@/features/calibration/types";
import { calibrationProxy } from "@/features/calibration/server/proxy";
import { apiEndpoints, detailPath } from "@/lib/api/endpoints";

interface Context { params: Promise<{ id: string }> }
export async function GET(request: Request, { params }: Context) {
  return calibrationProxy<Calibration>(request, detailPath(apiEndpoints.calibrations, (await params).id));
}
export async function PATCH(request: Request, { params }: Context) {
  return calibrationProxy<Calibration>(request, detailPath(apiEndpoints.calibrations, (await params).id), { method: "PATCH", body: await request.formData() });
}
export async function PUT(request: Request, { params }: Context) {
  return calibrationProxy<Calibration>(request, detailPath(apiEndpoints.calibrations, (await params).id), { method: "PUT", body: await request.formData() });
}
export async function DELETE(request: Request, { params }: Context) {
  return calibrationProxy<void>(request, detailPath(apiEndpoints.calibrations, (await params).id), { method: "DELETE" });
}
