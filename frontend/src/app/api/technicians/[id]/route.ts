import { bearerApiRequest } from "@/features/auth/server/bearer";
import type { Technician } from "@/features/technicians/types";
import { apiEndpoints, detailPath } from "@/lib/api/endpoints";
import { apiErrorResponse } from "@/lib/api/server";

interface Context { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Context) {
  try {
    const data = await bearerApiRequest<Technician>(request, detailPath(apiEndpoints.technicians, (await params).id));
    return Response.json(data);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    const body = contentType.includes("multipart/form-data")
      ? await request.formData()
      : JSON.stringify(await request.json());
    const data = await bearerApiRequest<Technician>(request, detailPath(apiEndpoints.technicians, (await params).id), {
      method: "PATCH",
      headers: body instanceof FormData ? undefined : { "Content-Type": "application/json" },
      body,
    });
    return Response.json(data);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    await bearerApiRequest<void>(request, detailPath(apiEndpoints.technicians, (await params).id), { method: "DELETE" });
    return new Response(null, { status: 204 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
