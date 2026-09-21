import type { Allocation, AllocationPage } from "@/features/allocations/types";
import { allocationProxy } from "@/features/allocations/server/proxy";
import { apiEndpoints } from "@/lib/api/endpoints";

export function GET(request: Request) { return allocationProxy<AllocationPage>(request, `${apiEndpoints.allocations}${new URL(request.url).search}`); }
export async function POST(request: Request) { return allocationProxy<Allocation>(request, apiEndpoints.allocations, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(await request.json()) }); }
