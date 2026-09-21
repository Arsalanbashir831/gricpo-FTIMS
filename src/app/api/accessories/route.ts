import type { Accessory } from "@/features/allocations/types";
import { allocationProxy } from "@/features/allocations/server/proxy";
import { apiEndpoints } from "@/lib/api/endpoints";

export function GET(request: Request) { return allocationProxy<{ count: number; results: Accessory[] }>(request, `${apiEndpoints.accessories}${new URL(request.url).search}`); }
export async function POST(request: Request) { return allocationProxy<Accessory>(request, apiEndpoints.accessories, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(await request.json()) }); }
