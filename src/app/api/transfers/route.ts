import type { Page, Transfer } from "@/features/movements/types";
import { movementProxy } from "@/features/movements/server/proxy";
import { apiEndpoints } from "@/lib/api/endpoints";

export function GET(request: Request) {
  return movementProxy<Page<Transfer>>(request, `${apiEndpoints.transfers}${new URL(request.url).search}`);
}

export async function POST(request: Request) {
  return movementProxy<Transfer>(request, apiEndpoints.transfers, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await request.json()),
  });
}
