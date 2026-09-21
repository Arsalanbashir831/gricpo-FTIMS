import { bearerApiRequest } from "@/features/auth/server/bearer";
import type { CurrentAccount } from "@/features/auth/types";
import { apiEndpoints } from "@/lib/api/endpoints";
import { apiErrorResponse } from "@/lib/api/server";

export async function GET(request: Request) {
  try {
    const account = await bearerApiRequest<CurrentAccount>(request, apiEndpoints.auth.me);
    return Response.json(account);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
