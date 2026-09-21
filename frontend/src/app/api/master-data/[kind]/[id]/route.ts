import { reportProxy } from "@/features/reports/server/proxy";
import { apiEndpoints } from "@/lib/api/endpoints";
interface Context { params: Promise<{ kind: string; id: string }> }
const path = async ({ params }: Context) => { const { kind, id } = await params; return `${apiEndpoints.masterData(kind)}${encodeURIComponent(id)}/`; };
export async function PATCH(request: Request, context: Context) { return reportProxy(request, await path(context), { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(await request.json()) }); }
export async function DELETE(request: Request, context: Context) { return reportProxy(request, await path(context), { method: "DELETE" }); }
