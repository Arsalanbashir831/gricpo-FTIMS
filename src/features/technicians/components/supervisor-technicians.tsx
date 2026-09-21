"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Eye, Pencil, RotateCcw, Search, ShieldCheck, Trash2, UserRoundX, UsersRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Administrator } from "@/features/auth/types";
import { TechnicianPhoto } from "@/features/technicians/components/technician-photo";
import type { Technician, TechnicianApprovalStatus, TechnicianPage } from "@/features/technicians/types";
import { authFetch } from "@/lib/api/client";

const statusStyles: Record<TechnicianApprovalStatus, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200", approved: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  rejected: "bg-rose-50 text-rose-800 ring-rose-200", suspended: "bg-slate-100 text-slate-700 ring-slate-200",
};

function errorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    const detail = (payload as { detail?: unknown }).detail;
    if (typeof detail === "string") return detail;
    const first = Object.values(payload as Record<string, unknown>)[0];
    if (Array.isArray(first) && typeof first[0] === "string") return first[0];
  }
  return fallback;
}

function StatusBadge({ status }: { status: TechnicianApprovalStatus }) {
  return <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${statusStyles[status]}`}>{status}</span>;
}

export function SupervisorTechnicians() {
  const [records, setRecords] = useState<Technician[]>([]);
  const [administrators, setAdministrators] = useState<Administrator[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"" | TechnicianApprovalStatus>("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [techniciansResponse, administratorsResponse] = await Promise.all([
        authFetch("/api/technicians?page_size=100"), authFetch("/api/administrators"),
      ]);
      const technicianPayload = await techniciansResponse.json() as TechnicianPage | { detail?: string };
      if (!techniciansResponse.ok) throw new Error(errorMessage(technicianPayload, "Technicians could not be loaded."));
      const page = technicianPayload as TechnicianPage;
      setRecords(page.results);
      setSelectedId((current) => current && page.results.some((item) => item.id === current) ? current : (page.results[0]?.id ?? null));
      if (administratorsResponse.ok) setAdministrators(((await administratorsResponse.json()) as { results: Administrator[] }).results);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Technicians could not be loaded.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  const selected = records.find((item) => item.id === selectedId) ?? null;
  const pending = records.filter((item) => item.status === "pending");
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return records.filter((item) => (!status || item.status === status) && (!term || `${item.technician_number} ${item.name} ${item.contact} ${item.discipline} ${item.qualification}`.toLowerCase().includes(term)));
  }, [query, records, status]);

  async function review(technician: Technician, decision: Exclude<TechnicianApprovalStatus, "pending">) {
    setWorking(true); setError("");
    try {
      const response = await authFetch(`/api/technicians/${technician.id}/review`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: decision, notes: notes.trim() }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(errorMessage(payload, "The review could not be saved."));
      setNotes(""); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The review could not be saved."); }
    finally { setWorking(false); }
  }

  async function assign(administrator: string) {
    if (!selected || !administrator) return;
    setWorking(true); setError("");
    try {
      const response = await authFetch(`/api/technicians/${selected.id}/assign`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ administrator: Number(administrator) }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(errorMessage(payload, "The supervisor could not be assigned."));
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The supervisor could not be assigned."); }
    finally { setWorking(false); }
  }

  async function remove(technician: Technician) {
    if (!window.confirm(`Delete ${technician.name}'s account request? This cannot be undone.`)) return;
    setWorking(true); setError("");
    try {
      const response = await authFetch(`/api/technicians/${technician.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(errorMessage(await response.json().catch(() => ({})), "The request could not be deleted."));
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The request could not be deleted."); }
    finally { setWorking(false); }
  }

  return <div className="space-y-5 p-4 sm:p-6 lg:p-7">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Technicians</h1><p className="mt-1 text-sm text-muted-foreground">Review account requests and manage approved technician profiles.</p></div><div className="rounded-lg bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 ring-1 ring-amber-200">{pending.length} pending {pending.length === 1 ? "request" : "requests"}</div></header>
    {error ? <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
    {pending.length > 0 ? <Card className="border-0 shadow-none ring-1 ring-amber-200"><CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="size-5 text-amber-600" /> Pending account requests</CardTitle></CardHeader><CardContent className="grid gap-3 lg:grid-cols-2">{pending.map((item) => <div key={item.id} className="rounded-lg border border-amber-100 bg-amber-50/40 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-900">{item.name}</p><p className="text-xs text-slate-500">{item.technician_number} · {item.discipline}</p><p className="mt-2 text-sm text-slate-700">{item.contact}</p></div><StatusBadge status={item.status} /></div><div className="mt-3 flex flex-wrap gap-2"><Button type="button" disabled={working} onClick={() => void review(item, "approved")}><Check className="size-4" /> Approve</Button><Button type="button" variant="outline" disabled={working} onClick={() => void review(item, "rejected")} className="border-rose-200 text-rose-700 hover:bg-rose-50"><UserRoundX className="size-4" /> Reject</Button><Button type="button" variant="ghost" disabled={working} onClick={() => void remove(item)} className="text-rose-700"><Trash2 className="size-4" /> Delete</Button></div></div>)}</CardContent></Card> : null}
    <div className={`grid items-start gap-5 ${selected ? "xl:grid-cols-[minmax(0,1fr)_380px]" : ""}`}>
      <Card className="min-w-0 border-0 shadow-none ring-1 ring-slate-200/80"><CardContent className="space-y-4"><div className="flex flex-wrap gap-2"><label className="relative min-w-60 flex-1"><span className="sr-only">Search technicians</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, number, contact, or discipline" className="h-10 pl-9" /></label><select aria-label="Filter by approval status" value={status} onChange={(event) => setStatus(event.target.value as "" | TechnicianApprovalStatus)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"><option value="">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="suspended">Suspended</option></select><Button type="button" variant="outline" onClick={() => { setQuery(""); setStatus(""); }}><RotateCcw className="size-4" /> Reset</Button></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-sky-50 text-slate-700"><tr>{["Technician", "Discipline", "Contact", "Equipment", "Status", "Action"].map((heading) => <th key={heading} className="px-3 py-3 font-semibold">{heading}</th>)}</tr></thead><tbody>{filtered.map((item) => <tr key={item.id} onClick={() => setSelectedId(item.id)} className={`cursor-pointer border-b border-slate-100 ${selectedId === item.id ? "bg-sky-50/70" : "hover:bg-slate-50"}`}><td className="px-3 py-3"><span className="font-semibold text-slate-900">{item.name}</span><span className="block text-xs text-slate-500">{item.technician_number}</span></td><td className="px-3 py-3">{item.discipline}</td><td className="px-3 py-3">{item.contact}</td><td className="px-3 py-3 tabular-nums">{item.assigned_equipment.length}</td><td className="px-3 py-3"><StatusBadge status={item.status} /></td><td className="px-3 py-3"><Button type="button" size="icon-sm" variant="ghost" aria-label={`View ${item.name}`} onClick={() => setSelectedId(item.id)}><Eye className="size-4" /></Button></td></tr>)}</tbody></table>{loading ? <p className="py-10 text-center text-sm text-slate-500">Loading technicians…</p> : filtered.length === 0 ? <p className="py-10 text-center text-sm text-slate-500">No technicians match these filters.</p> : null}</div></CardContent></Card>
      {selected ? <aside className="xl:sticky xl:top-20"><Card className="border-0 shadow-none ring-1 ring-slate-200/80"><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><UsersRound className="size-5 text-sky-600" /> Technician details</CardTitle><Button type="button" variant="ghost" size="icon-sm" aria-label="Close details" onClick={() => setSelectedId(null)}><X className="size-4" /></Button></CardHeader><CardContent className="space-y-4"><div className="flex items-center gap-4"><TechnicianPhoto src={selected.profile_photo} alt={`${selected.name} profile`} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="truncate text-xl font-semibold text-slate-900">{selected.name}</h2><StatusBadge status={selected.status} /></div><p className="mt-1 text-sm text-slate-500">{selected.technician_number}</p></div></div><dl className="space-y-2 text-sm">{[["Email", selected.email || "—"], ["Contact", selected.contact], ["Location", selected.location || "—"], ["Discipline", selected.discipline], ["Qualification", selected.qualification || "Not provided"], ["Skills", selected.skills || "—"], ["Certification expiry", selected.certification_expiry || "—"], ["Projects", selected.project_site_names.join(", ") || "None"], ["Assigned equipment", String(selected.assigned_equipment.length)], ["Review notes", selected.review_notes || "—"]].map(([label, value]) => <div key={label} className="grid grid-cols-[130px_1fr] gap-2 border-b border-slate-100 py-2"><dt className="text-slate-500">{label}</dt><dd className="font-medium text-slate-800">{value}</dd></div>)}</dl><label className="grid gap-1.5 text-sm font-medium text-slate-700">Assigned supervisor<select value={selected.administrator ?? ""} onChange={(event) => void assign(event.target.value)} disabled={working} className="h-10 rounded-lg border border-slate-200 bg-white px-3 font-normal"><option value="">Not assigned</option>{administrators.map((item) => <option key={item.id} value={item.id}>{item.first_name || item.last_name ? `${item.first_name} ${item.last_name}`.trim() : item.username}</option>)}</select></label><label className="grid gap-1.5 text-sm font-medium text-slate-700">Review note<textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional reason or instructions" className="rounded-lg border border-slate-200 p-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-sky-500" /></label><div className="grid gap-2 sm:grid-cols-2"><Button nativeButton={false} render={<Link href={`/supervisor/technicians/${selected.id}/edit`} />}><Pencil className="size-4" /> Edit profile</Button>{selected.status !== "approved" ? <Button type="button" onClick={() => void review(selected, "approved")} disabled={working}><Check className="size-4" /> Approve</Button> : <Button type="button" variant="outline" onClick={() => void review(selected, "suspended")} disabled={working}>Suspend access</Button>}<Button type="button" variant="outline" onClick={() => void review(selected, "rejected")} disabled={working} className="border-rose-200 text-rose-700 hover:bg-rose-50">Reject</Button>{selected.status === "pending" || selected.status === "rejected" ? <Button type="button" variant="ghost" onClick={() => void remove(selected)} disabled={working} className="text-rose-700"><Trash2 className="size-4" /> Delete request</Button> : null}</div></CardContent></Card></aside> : null}
    </div>
  </div>;
}
