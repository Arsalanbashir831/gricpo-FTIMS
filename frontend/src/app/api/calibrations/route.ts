import type { Calibration, CalibrationPage } from "@/features/calibration/types";
import { calibrationProxy } from "@/features/calibration/server/proxy";
import { apiEndpoints } from "@/lib/api/endpoints";

export async function GET(request: Request) {
  return calibrationProxy<CalibrationPage>(request, `${apiEndpoints.calibrations}${new URL(request.url).search}`);
}

export async function POST(request: Request) {
  return calibrationProxy<Calibration>(request, apiEndpoints.calibrations, { method: "POST", body: await request.formData() });
}
