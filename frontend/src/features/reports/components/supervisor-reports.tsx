"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Eye, FileClock, FileText, Search, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ReportPage, ReportStatusCode, TechnicianReport } from "@/features/reports/types";
import { authFetch } from "@/lib/api/client";

const labels: Record<ReportStatusCode, string> = { draft: "Draft", submitted: "Pending approval", approved: "Approved", rejected: "Rejected", revision_requested: "Revision requested" };
const tones: Record<ReportStatusCode, string> = { draft: "bg-slate-100 text-slate-700", submitted: "bg-amber-50 text-amber-800", approved: "bg-emerald-50 text-emerald-800", rejected: "bg-rose-50 text-rose-800", revision_requested: "bg-sky-50 text-sky-800" };
function Badge({ status }: { status: ReportStatusCode }) { return <span className={`rounded-md px-2.5 py-1 text-xs font-medium ${tones[status]}`}>{labels[status]}</span>; }
export function SupervisorReports() {
  const [reports, setReports] = useState<TechnicianReport[]>([]); const [query, setQuery] = useState(""); const [status, setStatus] = useState(""); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async () => { try { const response = await authFetch("/api/reports?page_size=100"); const payload = await response.json(); if (!response.ok) throw new Error(payload.detail ?? "Reports could not be loaded."); setReports((payload as ReportPage).results); } catch (cause) { setError(cause instanceof Error ? cause.message : "Reports could not be loaded."); } finally { setLoading(false); } }, []);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  const visible = useMemo(() => reports.filter((report) => (!status || (status === "returned" ? ["rejected", "revision_requested"].includes(report.status) : report.status === status)) && (!query.trim() || `${report.report_number} ${report.technician_name} ${report.project_site_name} ${report.test_method}`.toLowerCase().includes(query.toLowerCase()))), [reports, query, status]);
  const counts = { submitted: reports.filter((item) => item.status === "submitted").length, approved: reports.filter((item) => item.status === "approved").length, returned: reports.filter((item) => ["rejected", "revision_requested"].includes(item.status)).length };
  const cards = [
    { label: "Pending approval", value: counts.submitted, icon: FileClock, filter: "submitted" },
    { label: "Approved", value: counts.approved, icon: CheckCircle2, filter: "approved" },
    { label: "Rejected / revision", value: counts.returned, icon: XCircle, filter: "returned" },
  ];
  return <div className="space-y-5 p-4 sm:p-6 lg:p-7"><div><h1 className="text-3xl font-semibold">Reports</h1><p className="mt-1 text-sm text-muted-foreground">Review technician PDF submissions and control authenticated publication.</p></div>
    {error ? <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
    <div className="grid gap-3 sm:grid-cols-3">{cards.map(({ label, value, icon: Icon, filter }) => <button key={label} type="button" onClick={() => setStatus(filter)} className="flex items-center gap-4 rounded-xl bg-white p-4 text-left ring-1 ring-slate-200"><Icon className="size-8 text-sky-700" /><span><strong className="block text-2xl">{value}</strong><span className="text-sm">{label}</span></span></button>)}</div>
    <Card className="border-0 ring-1 ring-slate-200"><CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3"><CardTitle className="flex items-center gap-2"><FileText className="size-5 text-sky-700" />Technician report queue</CardTitle><div className="flex gap-2"><label className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reports…" className="pl-9" /></label><select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-lg border bg-white px-3 text-sm"><option value="">All statuses</option>{Object.entries(labels).map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></div></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-sky-50"><tr>{["Report", "Technician", "Project / site", "Methods", "Test date", "Submitted", "Status", "Action"].map((item) => <th key={item} className="px-3 py-3">{item}</th>)}</tr></thead><tbody>{visible.map((report) => <tr key={report.id} className="border-b"><td className="px-3 py-3 font-semibold">{report.report_number}</td><td className="px-3 py-3">{report.technician_name}</td><td className="px-3 py-3">{report.project_site_name}</td><td className="px-3 py-3">{report.test_method}</td><td className="px-3 py-3">{report.test_date}</td><td className="px-3 py-3">{report.submitted_at ? new Date(report.submitted_at).toLocaleString() : "—"}</td><td className="px-3 py-3"><Badge status={report.status} /></td><td className="px-3 py-3"><Button nativeButton={false} size="sm" variant="outline" render={<Link href={`/supervisor/reports/${report.id}`} />}><Eye className="size-4" />View</Button></td></tr>)}</tbody></table>{!loading && !visible.length ? <p className="py-10 text-center text-sm text-slate-500">No reports found.</p> : null}</div></CardContent></Card>
  </div>;
}
