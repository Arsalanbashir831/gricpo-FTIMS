import type { Allocation } from "@/features/allocations/types";
import { allocationProxy } from "@/features/allocations/server/proxy";
import { apiEndpoints } from "@/lib/api/endpoints";

export async function POST(request: Request) {
  return allocationProxy<Allocation[]>(request, `${apiEndpoints.allocations}bulk/`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(await request.json()),
  });
}
