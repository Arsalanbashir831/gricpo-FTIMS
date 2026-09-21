import type { Transfer } from "@/features/movements/types";
import { movementProxy } from "@/features/movements/server/proxy";
import { actionPath, apiEndpoints } from "@/lib/api/endpoints";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return movementProxy<Transfer>(request, actionPath(apiEndpoints.transfers, id, "review"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await request.json()),
  });
}
