import type { CalibrationSummary } from "@/features/calibration/types";
import { calibrationProxy } from "@/features/calibration/server/proxy";
import { apiEndpoints } from "@/lib/api/endpoints";

export async function GET(request: Request) {
  return calibrationProxy<CalibrationSummary>(request, `${apiEndpoints.calibrationSummary}${new URL(request.url).search}`);
}
