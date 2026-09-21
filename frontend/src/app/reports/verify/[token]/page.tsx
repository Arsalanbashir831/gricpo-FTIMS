import type { TechnicianReport } from "@/features/reports/types";
import { apiEndpoints } from "@/lib/api/endpoints";
import { apiRequest } from "@/lib/api/server";
import { CheckCircle2, FileText, ShieldCheck } from "lucide-react";

export default async function VerifiedReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  let report: TechnicianReport | null = null;
  try { report = await apiRequest<TechnicianReport>(apiEndpoints.publicReport(token)); } catch { /* render not found */ }
  if (!report) return <main className="mx-auto max-w-xl p-8"><h1 className="text-2xl font-semibold">Report not found</h1><p className="mt-2 text-slate-600">This verification link is invalid or the report is not approved.</p></main>;
  return <main className="min-h-screen bg-sky-50 p-5 sm:p-10"><div className="mx-auto max-w-3xl space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><div className="flex items-center gap-3"><span className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><ShieldCheck className="size-7" /></span><div><h1 className="text-2xl font-semibold">Authenticated report</h1><p className="text-sm text-emerald-700"><CheckCircle2 className="mr-1 inline size-4" />Approved by GRIPCO</p></div></div><dl className="grid gap-4 text-sm sm:grid-cols-2">{[["Report number", report.report_number], ["Technician", report.technician_name], ["Project / site", report.project_site_name], ["Test method", report.test_method], ["Test date", report.test_date], ["Approved", report.reviewed_at ? new Date(report.reviewed_at).toLocaleString() : "—"]].map(([label, value]) => <div key={label} className="border-b pb-2"><dt className="text-slate-500">{label}</dt><dd className="font-medium">{value}</dd></div>)}</dl><p className="rounded-lg bg-slate-50 p-3 text-sm">{report.remarks || "No remarks."}</p><a href={`/api/public/reports/${token}/file`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-lg bg-sky-600 px-4 text-sm font-medium text-white hover:bg-sky-700"><FileText className="size-4" />Open approved PDF</a></div></main>;
}
