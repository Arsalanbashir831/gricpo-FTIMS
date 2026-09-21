import { bearerApiRequest } from "@/features/auth/server/bearer";
import type { Technician } from "@/features/technicians/types";
import { actionPath, apiEndpoints } from "@/lib/api/endpoints";
import { apiErrorResponse } from "@/lib/api/server";

interface Context { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Context) {
  try {
    const data = await bearerApiRequest<Technician>(request, actionPath(apiEndpoints.technicians, (await params).id, "review"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(await request.json()),
    });
    return Response.json(data);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
