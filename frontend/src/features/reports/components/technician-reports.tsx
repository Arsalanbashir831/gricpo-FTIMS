"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Clock3, FilePlus2, FileText, MessageSquareText, RefreshCw, RotateCcw, Send, Upload, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { QrCodeSvg } from "@/components/shared/qr-code";
import type { ReportPage, ReportStatusCode, TechnicianReport } from "@/features/reports/types";
import { usePageOrigin } from "@/hooks/use-page-origin";
import { authFetch, downloadAuthenticatedFile } from "@/lib/api/client";

type ReportsTab = "history" | "submit";
interface ReportAllocationOption {
  id: number; equipment: number; equipment_number: string; equipment_description: string;
  project_site: number; project_site_name: string; client_name: string;
}
const control = "h-10 rounded-lg border bg-white px-3 text-sm";
const tabClass = (active: boolean) => `flex h-11 items-center gap-2 border-b-2 px-4 text-sm font-medium transition-colors ${active ? "border-sky-600 bg-white text-sky-700" : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900"}`;
const statusPresentation: Record<ReportStatusCode, { label: string; className: string; icon: typeof Clock3 }> = {
  draft: { label: "Draft", className: "bg-slate-100 text-slate-700", icon: FileText },
  submitted: { label: "Awaiting review", className: "bg-sky-50 text-sky-700", icon: Clock3 },
  approved: { label: "Approved", className: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
  rejected: { label: "Rejected", className: "bg-rose-50 text-rose-700", icon: XCircle },
  revision_requested: { label: "Changes requested", className: "bg-amber-50 text-amber-700", icon: RotateCcw },
};

export function TechnicianReports() {
  const origin = usePageOrigin();
  const [tab, setTab] = useState<ReportsTab>("history");
  const [allocations, setAllocations] = useState<ReportAllocationOption[]>([]);
  const [methods, setMethods] = useState<Array<{ code: string; name: string }>>([]);
  const [reports, setReports] = useState<TechnicianReport[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editing, setEditing] = useState<TechnicianReport | null>(null);
  const [allocationId, setAllocationId] = useState(0);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [date, setDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [remarks, setRemarks] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const [allocationsResponse, reportsResponse, methodsResponse] = await Promise.all([
        authFetch("/api/allocations/report-options"),
        authFetch("/api/reports?page_size=100"),
        authFetch("/api/master-data/test-methods"),
      ]);
      const [allocationsPayload, reportsPayload, methodsPayload] = await Promise.all([
        allocationsResponse.json(), reportsResponse.json(), methodsResponse.json(),
      ]);
      if (!allocationsResponse.ok || !reportsResponse.ok || !methodsResponse.ok) {
        throw new Error(allocationsPayload.detail ?? reportsPayload.detail ?? methodsPayload.detail ?? "Reports could not be loaded.");
      }
      setAllocations(allocationsPayload.results);
      setReports((reportsPayload as ReportPage).results);
      setMethods(methodsPayload.results);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Reports could not be loaded.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  function reset() {
    setEditing(null); setAllocationId(0); setSelectedMethods([]);
    setDate(new Date().toLocaleDateString("en-CA")); setRemarks(""); setFile(null);
  }

  function revise(report: TechnicianReport) {
    setEditing(report); setAllocationId(report.allocation ?? 0);
    setSelectedMethods(report.test_methods?.length ? report.test_methods : methods.filter((item) => item.name === report.test_method).map((item) => item.code));
    setDate(report.test_date); setRemarks(report.remarks); setFile(null);
    setTab("submit"); setMessage(""); setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resubmitRejected(report: TechnicianReport) {
    revise(report);
    setEditing(null);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!allocationId) { setError("Choose an allocation ID."); return; }
    if (!editing && !allocations.some((item) => item.id === allocationId)) { setError("This allocation already has a report or is no longer active. Refresh the page and choose an eligible allocation."); return; }
    if (!selectedMethods.length) { setError("Choose at least one test method."); return; }
    if (!file || (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf")) { setError("Select a PDF report file."); return; }
    setSaving(true); setError(""); setMessage("");
    try {
      const body = new FormData();
      body.set("report_number", editing?.report_number ?? `REP-${Date.now()}`);
      body.set("allocation", String(allocationId));
      selectedMethods.forEach((code) => body.append("test_methods", code));
      body.set("test_date", date); body.set("remarks", remarks); body.set("report_file", file);
      const saveResponse = await authFetch(editing ? `/api/reports/${editing.id}` : "/api/reports", { method: editing ? "PATCH" : "POST", body });
      const saved = await saveResponse.json();
      if (!saveResponse.ok) throw new Error(saved.detail ?? Object.values(saved)[0] ?? "Report could not be saved.");
      const submitResponse = await authFetch(`/api/reports/${saved.id}/submit`, { method: "POST" });
      const submitted = await submitResponse.json();
      if (!submitResponse.ok) throw new Error(submitted.detail ?? "Report could not be submitted.");
      reset(); setMessage(`${submitted.report_number} was submitted for supervisor approval.`);
      await load(); setTab("history"); setExpandedId(submitted.id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Report could not be submitted.");
    } finally { setSaving(false); }
  }

  const selectedAllocation = allocations.find((item) => item.id === allocationId) ??
    (editing?.allocation === allocationId && allocationId ? {
      id: allocationId, equipment: editing.equipment[0],
      equipment_number: editing.equipment_details[0]?.equipment_number ?? "—",
      equipment_description: editing.equipment_details[0]?.description ?? "",
      project_site: editing.project_site, project_site_name: editing.project_site_name, client_name: "",
    } : null);

  return <div className="space-y-5 p-4 sm:p-6 lg:p-7">
    <div><h1 className="text-3xl font-semibold">Reports</h1><p className="text-sm text-slate-500">Submit PDF test reports and follow every supervisor decision.</p></div>
    <div role="tablist" aria-label="Technician reports" className="flex overflow-x-auto border-b border-slate-200">
      <button type="button" role="tab" aria-selected={tab === "history"} className={tabClass(tab === "history")} onClick={() => { setTab("history"); void load(); }}><FileText className="size-4" />Submission history<span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{reports.length}</span></button>
      <button type="button" role="tab" aria-selected={tab === "submit"} className={tabClass(tab === "submit")} onClick={() => { setTab("submit"); setError(""); }}><FilePlus2 className="size-4" />Submit report</button>
    </div>
    {error ? <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
    {message ? <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}

    {tab === "history" ? <Card className="border-0 ring-1 ring-slate-200"><CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3"><div><CardTitle>Submission history</CardTitle><p className="mt-1 text-sm text-slate-500">Review approval progress, supervisor feedback and submitted report details.</p></div><Button type="button" size="sm" variant="outline" disabled={refreshing} onClick={() => void load()}><RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />Refresh status</Button></CardHeader><CardContent><div className="space-y-3">
      {reports.map((report) => {
        const presentation = statusPresentation[report.status]; const StatusIcon = presentation.icon; const expanded = expandedId === report.id;
        return <article key={report.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center gap-3 p-4"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-slate-900">{report.report_number}</p><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${presentation.className}`}><StatusIcon className="size-3.5" />{presentation.label}</span></div><p className="mt-1 text-sm text-slate-500">{report.project_site_name} · {report.test_method} · {report.test_date}</p></div>
            {report.review_notes ? <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700"><MessageSquareText className="size-4" />Supervisor comment</span> : null}
            {report.status === "revision_requested" ? <Button type="button" size="sm" onClick={() => revise(report)}><RotateCcw className="size-4" />Revise report</Button> : null}
            {report.status === "rejected" && report.allocation && allocations.some((item) => item.id === report.allocation) ? <Button type="button" size="sm" onClick={() => resubmitRejected(report)}><RotateCcw className="size-4" />Submit replacement</Button> : null}
            {report.status === "approved" && report.verification_token ? <Button nativeButton={false} size="sm" variant="outline" render={<a href={`/reports/verify/${report.verification_token}`} />}><Send className="size-4" />Open verified report</Button> : null}
            <Button type="button" size="sm" variant="ghost" aria-expanded={expanded} onClick={() => setExpandedId(expanded ? null : report.id)}>{report.status === "approved" ? "Details & QR" : report.status === "rejected" || report.status === "revision_requested" ? "View feedback" : "Details"} {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}</Button>
          </div>
          {expanded ? <div className="border-t border-slate-200 bg-slate-50/70 p-4">
            {report.review_notes ? <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3"><p className="flex items-center gap-2 text-sm font-semibold text-amber-900"><MessageSquareText className="size-4" />Supervisor feedback</p><p className="mt-1 whitespace-pre-wrap text-sm text-amber-800">{report.review_notes}</p></div> : <p className="mb-4 text-sm text-slate-500">No supervisor comments have been added.</p>}
            <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4"><div><dt className="text-xs text-slate-500">Allocation ID</dt><dd className="mt-1 font-medium">{report.allocation ? `#${report.allocation}` : "Legacy report"}</dd></div><div><dt className="text-xs text-slate-500">Equipment</dt><dd className="mt-1 font-medium">{report.equipment_details.map((item) => item.equipment_number).join(", ") || "—"}</dd></div><div><dt className="text-xs text-slate-500">Test methods</dt><dd className="mt-1 font-medium">{report.test_method}</dd></div><div><dt className="text-xs text-slate-500">Submitted</dt><dd className="mt-1 font-medium">{report.submitted_at ? new Date(report.submitted_at).toLocaleString() : "Not submitted"}</dd></div><div><dt className="text-xs text-slate-500">Reviewed by</dt><dd className="mt-1 font-medium">{report.assigned_administrator_name || "Awaiting supervisor"}</dd></div><div><dt className="text-xs text-slate-500">Reviewed</dt><dd className="mt-1 font-medium">{report.reviewed_at ? new Date(report.reviewed_at).toLocaleString() : "Pending"}</dd></div></dl>
            {report.remarks ? <p className="mt-4 border-t pt-3 text-sm text-slate-600"><span className="font-medium text-slate-800">Technician remarks:</span> {report.remarks}</p> : null}
            {report.status === "approved" && report.verification_token && origin ? <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg border border-emerald-200 bg-white p-4"><div className="flex size-36 shrink-0 items-center justify-center rounded-lg border p-2"><QrCodeSvg value={`${origin}/reports/verify/${report.verification_token}`} label={`approved report ${report.report_number}`} className="size-full" /></div><div className="space-y-2"><p className="text-sm font-semibold text-slate-900">Approved report QR</p><p className="max-w-sm text-xs text-slate-600">Scan to open the public verification page and approved PDF.</p><a href={`/reports/verify/${report.verification_token}`} className="inline-flex text-sm font-medium text-sky-700 hover:underline">Open verification page</a></div></div> : null}
            {report.report_file ? <button type="button" onClick={() => void downloadAuthenticatedFile(report.report_file!, `${report.report_number}.pdf`).catch((cause) => setError(cause instanceof Error ? cause.message : "The PDF could not be downloaded."))} className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-sky-700 hover:text-sky-800"><FileText className="size-4" />Download submitted PDF</button> : null}
          </div> : null}
        </article>;
      })}
      {!reports.length ? <div className="py-12 text-center"><FileText className="mx-auto size-8 text-slate-300" /><p className="mt-3 font-medium text-slate-700">No reports submitted yet</p><Button type="button" className="mt-4" onClick={() => setTab("submit")}><FilePlus2 className="size-4" />Submit your first report</Button></div> : null}
    </div></CardContent></Card> :
    <Card className="border-0 ring-1 ring-slate-200"><CardHeader><CardTitle>{editing ? `Revise ${editing.report_number}` : "Submit report for review"}</CardTitle><p className="text-sm text-slate-500">{editing ? "Address the supervisor feedback and upload a revised PDF." : "Complete the test details and upload the final PDF for supervisor approval."}</p></CardHeader><CardContent>
      {editing?.review_notes ? <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"><p className="font-semibold">Supervisor feedback</p><p className="mt-1 whitespace-pre-wrap">{editing.review_notes}</p></div> : null}
      {!editing && !allocations.length ? <p className="mb-4 rounded-lg bg-sky-50 p-3 text-sm text-sky-800">No allocations are available for a new report. Reports awaiting review or already approved cannot be submitted again; a rejected report can be replaced.</p> : null}
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium">Allocation ID<select required value={allocationId || ""} onChange={(event) => setAllocationId(Number(event.target.value))} className={control}><option value="">Select your allocation</option>{selectedAllocation && !allocations.some((item) => item.id === selectedAllocation.id) ? <option value={selectedAllocation.id}>#{selectedAllocation.id} — {selectedAllocation.equipment_number} (previous allocation)</option> : null}{allocations.map((item) => <option key={item.id} value={item.id}>#{item.id} — {item.equipment_number} · {item.project_site_name}</option>)}</select></label>
          <label className="grid gap-1 text-sm font-medium">Test date<Input required type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
          <div className="grid gap-1 text-sm font-medium"><span>Project / site</span><div className={`${control} flex items-center text-slate-700`}>{selectedAllocation ? `${selectedAllocation.project_site_name}${selectedAllocation.client_name ? ` — ${selectedAllocation.client_name}` : ""}` : "Select an allocation to see its project"}</div></div>
          <label className="grid gap-1 text-sm font-medium">PDF report<Input required type="file" accept="application/pdf,.pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /></label>
        </div>
        <div className="grid gap-1 text-sm font-medium"><span>Equipment from allocation</span><div className={`${control} flex items-center text-slate-700`}>{selectedAllocation ? `${selectedAllocation.equipment_number} — ${selectedAllocation.equipment_description}` : "Select an allocation to see its equipment"}</div></div>
        <fieldset><legend className="text-sm font-medium">Test methods *</legend><div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{methods.map((item) => <label key={item.code} className="flex items-center gap-2 rounded-lg border p-2 text-sm"><input type="checkbox" checked={selectedMethods.includes(item.code)} onChange={() => setSelectedMethods((current) => current.includes(item.code) ? current.filter((code) => code !== item.code) : [...current, item.code])} />{item.name}</label>)}</div></fieldset>
        <label className="grid gap-1 text-sm font-medium">Remarks<textarea value={remarks} onChange={(event) => setRemarks(event.target.value)} rows={3} className="rounded-lg border p-3" /></label><div className="flex justify-end gap-2">{editing ? <Button type="button" variant="outline" onClick={() => { reset(); setTab("history"); }}><RotateCcw className="size-4" />Cancel revision</Button> : null}<Button type="submit" disabled={saving || !allocationId || !selectedMethods.length}><Upload className="size-4" />{saving ? "Submitting…" : editing ? "Upload revision" : "Upload and submit"}</Button></div>
      </form>
    </CardContent></Card>}
  </div>;
}
