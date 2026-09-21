import { bearerApiRequest } from "@/features/auth/server/bearer";
import { apiErrorResponse } from "@/lib/api/server";
export async function GET(request: Request) { try { return Response.json(await bearerApiRequest(request, "/dashboard/summary/")); } catch (error) { return apiErrorResponse(error); } }
