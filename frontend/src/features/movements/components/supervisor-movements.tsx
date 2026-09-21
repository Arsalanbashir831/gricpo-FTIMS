"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeftRight, Check, ClipboardCheck, PackageCheck, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DashboardTable, StatusPill } from "@/components/shared/dashboard-widgets";
import type { EquipmentReturn, MovementReferences, Page, Transfer } from "@/features/movements/types";
import { authFetch } from "@/lib/api/client";

type Tab = "returns" | "transfers";
type ReturnSource = "Technician" | "Site";
const conditions = ["Good", "Minor wear", "Requires maintenance", "Damaged"] as const;
const controlClass = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-sky-500";
const textAreaClass = "min-h-20 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm font-normal text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-sky-500";
const today = () => new Date().toLocaleDateString("en-CA");
const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(value)) : "—";
const formatDateTime = (value: string) => new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
function localDateTime(value: string | Date = new Date()) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return <label className="grid min-w-0 gap-1.5 text-sm font-medium text-slate-700">{label}{required ? <span className="sr-only">required</span> : null}{children}</label>;
}
function errorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const record = payload as Record<string, unknown>;
  if (typeof record.detail === "string") return record.detail;
  const first = Object.values(record)[0];
  if (typeof first === "string") return first;
  if (Array.isArray(first) && typeof first[0] === "string") return first[0];
  return fallback;
}
function returnTimestamp(value: string) { return new Date(value).toISOString(); }

export function SupervisorMovements() {
  const [tab, setTab] = useState<Tab>("returns");
  const [references, setReferences] = useState<MovementReferences | null>(null);
  const [returns, setReturns] = useState<EquipmentReturn[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [returnAllocationId, setReturnAllocationId] = useState(0);
  const [source, setSource] = useState<ReturnSource>("Technician");
  const [technicianId, setTechnicianId] = useState(0);
  const [returnSite, setReturnSite] = useState(0);
  const [returnDate, setReturnDate] = useState(localDateTime);
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [condition, setCondition] = useState<(typeof conditions)[number]>("Good");
  const [conditionNotes, setConditionNotes] = useState("");
  const [requiresMaintenance, setRequiresMaintenance] = useState(false);
  const [missing, setMissing] = useState<Record<number, number>>({});
  const [returnRemarks, setReturnRemarks] = useState("");
  const [transferReturnId, setTransferReturnId] = useState(0);
  const [toTechnicianId, setToTechnicianId] = useState(0);
  const [reason, setReason] = useState("");
  const [transferRemarks, setTransferRemarks] = useState("");

  const selectedReturnAllocation = references?.allocations.find((item) => item.id === returnAllocationId);
  const selectedTransferReturn = returns.find((item) => item.id === transferReturnId);
  const eligibleReturns = returns.filter((item) => !item.requires_maintenance && !["damaged", "requires maintenance"].includes(item.condition.toLowerCase()) && new Date(item.returned_at).toLocaleDateString("en-CA") === today() && !transfers.some((transfer) => transfer.source_return === item.id));
  const returnTechnicians = useMemo(() => {
    if (!selectedReturnAllocation || !references) return [];
    const ids = new Set([selectedReturnAllocation.custodian, ...selectedReturnAllocation.additional_technicians]);
    return references.technicians.filter((item) => ids.has(item.id));
  }, [references, selectedReturnAllocation]);

  const load = useCallback(async () => {
    try {
      const responses = await Promise.all([authFetch("/api/movements/references"), authFetch("/api/returns?page_size=100"), authFetch("/api/transfers?page_size=100")]);
      const failed = responses.find((response) => !response.ok);
      if (failed) throw new Error(errorMessage(await failed.json().catch(() => ({})), "Movement records could not be loaded."));
      const [referenceData, returnData, transferData] = await Promise.all(responses.map((response) => response.json()));
      setReferences(referenceData as MovementReferences);
      setReturns((returnData as Page<EquipmentReturn>).results);
      setTransfers((transferData as Page<Transfer>).results);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Movement records could not be loaded."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  function chooseReturnAllocation(id: number) {
    setReturnAllocationId(id); setMissing({});
    const allocation = references?.allocations.find((item) => item.id === id);
    setTechnicianId(allocation?.custodian ?? 0); setReturnSite(allocation?.project_site ?? 0);
    setReturnDate(localDateTime());
    setExpectedReturnDate(allocation?.expected_return?.slice(0, 10) ?? "");
  }
  function toggleMissing(accessoryId: number) {
    setMissing((current) => { const next = { ...current }; if (next[accessoryId]) delete next[accessoryId]; else next[accessoryId] = 1; return next; });
  }
  function resetReturn() {
    setReturnAllocationId(0); setSource("Technician"); setTechnicianId(0); setReturnSite(0); setReturnDate(localDateTime()); setExpectedReturnDate("");
    setCondition("Good"); setConditionNotes(""); setRequiresMaintenance(false); setMissing({}); setReturnRemarks(""); setError("");
  }
  function resetTransfer() {
    setTransferReturnId(0); setToTechnicianId(0); setReason(""); setTransferRemarks(""); setError("");
  }

  async function submitReturn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedReturnAllocation || !technicianId || (source === "Site" && !returnSite)) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const remarks = [conditionNotes.trim(), returnRemarks.trim()].filter(Boolean).join("\n\n");
      const response = await authFetch("/api/returns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ allocation_id: selectedReturnAllocation.id, technician_id: technicianId, returned_at: returnTimestamp(returnDate), expected_return: expectedReturnDate ? `${expectedReturnDate}T23:59:59Z` : null, condition, requires_maintenance: requiresMaintenance || condition === "Requires maintenance" || condition === "Damaged", remarks, missing_accessories: Object.entries(missing).map(([allocation_accessory_id, quantity]) => ({ allocation_accessory_id: Number(allocation_accessory_id), quantity })) }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(errorMessage(payload, "The return could not be processed."));
      resetReturn(); setNotice(`Return #${(payload as EquipmentReturn).id} was processed successfully.`); await load();
      if (!(payload as EquipmentReturn).requires_maintenance && !["damaged", "requires maintenance"].includes((payload as EquipmentReturn).condition.toLowerCase())) {
        setTransferReturnId((payload as EquipmentReturn).id);
        setTab("transfers");
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The return could not be processed."); }
    finally { setSaving(false); }
  }
  async function submitTransfer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTransferReturn || !toTechnicianId || !reason.trim()) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const response = await authFetch("/api/transfers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ return_id: selectedTransferReturn.id, to_technician_id: toTechnicianId, reason: reason.trim(), remarks: transferRemarks.trim() }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(errorMessage(payload, "The transfer request could not be created."));
      resetTransfer(); setNotice(`${(payload as Transfer).transfer_number} was submitted for approval.`); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The transfer request could not be created."); }
    finally { setSaving(false); }
  }
  async function reviewTransfer(transfer: Transfer, approve: boolean) {
    setReviewingId(transfer.id); setError(""); setNotice("");
    try {
      const allocation = references?.allocations.find((item) => item.id === transfer.source_allocation);
      const returned = returns.find((item) => item.id === transfer.source_return);
      const response = await authFetch(`/api/transfers/${transfer.id}/review`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ approve, additional_technician_ids: [], expected_return: approve ? returned?.expected_return ?? allocation?.expected_return ?? null : null }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(errorMessage(payload, "The transfer could not be reviewed."));
      setNotice(`${transfer.transfer_number} was ${approve ? "approved" : "rejected"}.`); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The transfer could not be reviewed."); }
    finally { setReviewingId(null); }
  }

  const tabClass = (active: boolean) => `inline-flex min-w-48 items-center justify-center gap-2 border-b-[3px] px-5 py-3 text-sm font-semibold transition-colors ${active ? "border-sky-600 bg-white text-sky-700" : "border-transparent bg-sky-50 text-slate-600 hover:bg-sky-100"}`;
  if (loading && !references) return <div className="p-7 text-sm text-slate-500">Loading returns and transfers…</div>;

  return <div className="space-y-5 p-4 sm:p-6 lg:p-7">
    <header><h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Returns / Transfers</h1><p className="mt-1 text-sm text-muted-foreground">Process equipment custody changes against active allocation records.</p></header>
    <div role="tablist" aria-label="Equipment movements" className="flex overflow-x-auto border-b border-slate-200"><button type="button" role="tab" aria-selected={tab === "returns"} className={tabClass(tab === "returns")} onClick={() => { setTab("returns"); setNotice(""); setError(""); }}><PackageCheck className="size-4" /> Equipment returns</button><button type="button" role="tab" aria-selected={tab === "transfers"} className={tabClass(tab === "transfers")} onClick={() => { setTab("transfers"); setNotice(""); setError(""); }}><ArrowLeftRight className="size-4" /> Equipment transfers</button></div>
    {error ? <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}{notice ? <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p> : null}
    {tab === "returns" ? <section className="space-y-5"><Card className="gap-4 border-0 shadow-none ring-1 ring-slate-200/80"><CardHeader><CardTitle className="flex items-center gap-3 text-lg"><span className="flex size-10 items-center justify-center rounded-lg bg-sky-600 text-white"><PackageCheck className="size-5" /></span>Equipment return processing</CardTitle></CardHeader><CardContent><form onSubmit={submitReturn} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3"><Field label="Active allocation / equipment" required><select className={controlClass} required value={returnAllocationId || ""} onChange={(event) => chooseReturnAllocation(Number(event.target.value))}><option value="">Select allocated equipment</option>{references?.allocations.map((item) => <option key={item.id} value={item.id}>{item.equipment_number} — {item.equipment_description}</option>)}</select></Field><Field label="Equipment description"><Input readOnly value={selectedReturnAllocation?.equipment_description ?? ""} placeholder="Select equipment" className="h-10 bg-slate-50" /></Field><Field label="Returning from" required><select className={controlClass} required value={source} onChange={(event) => setSource(event.target.value as ReturnSource)}><option value="Technician">Technician</option><option value="Site">Site</option></select></Field>
      {source !== "Technician" ? <Field label="Project / Site" required><select className={controlClass} required value={returnSite || ""} onChange={(event) => setReturnSite(Number(event.target.value))}><option value="">Select site</option>{references?.projects.filter((site) => site.id === selectedReturnAllocation?.project_site).map((site) => <option key={site.id} value={site.id}>{site.name} — {site.client_name}</option>)}</select></Field> : null}{source === "Technician" ? <Field label="Returning technician" required><select className={controlClass} required value={technicianId || ""} onChange={(event) => setTechnicianId(Number(event.target.value))}><option value="">Select technician</option>{returnTechnicians.map((item) => <option key={item.id} value={item.id}>{item.technician_number} — {item.name}</option>)}</select></Field> : null}<Field label="Return date and time" required><Input type="datetime-local" required max={localDateTime()} min={selectedReturnAllocation ? localDateTime(selectedReturnAllocation.allocated_at) : undefined} value={returnDate} onChange={(event) => setReturnDate(event.target.value)} className="h-10" /></Field><Field label="Expected return date"><Input type="date" min={selectedReturnAllocation?.allocated_at.slice(0, 10)} value={expectedReturnDate} onChange={(event) => setExpectedReturnDate(event.target.value)} className="h-10" /></Field></div>
      {selectedReturnAllocation ? <p className="rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-800">Allocation #{selectedReturnAllocation.id} · allocated {formatDateTime(selectedReturnAllocation.allocated_at)} · {selectedReturnAllocation.project_site_name} · {selectedReturnAllocation.custodian_name}</p> : null}
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]"><fieldset className="rounded-lg border p-4"><legend className="px-1 text-sm font-semibold">Condition check</legend><div className="flex flex-wrap gap-4">{conditions.map((item) => <label key={item} className="inline-flex items-center gap-2 text-sm"><input type="radio" name="condition" checked={condition === item} onChange={() => setCondition(item)} className="accent-sky-600" />{item}</label>)}</div><textarea aria-label="Condition notes" value={conditionNotes} onChange={(event) => setConditionNotes(event.target.value)} placeholder="Describe the equipment condition" className={`${textAreaClass} mt-3`} /><label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={requiresMaintenance} onChange={(event) => setRequiresMaintenance(event.target.checked)} className="accent-sky-600" />Mark as requiring maintenance</label></fieldset>
      <fieldset className="rounded-lg border p-4"><legend className="px-1 text-sm font-semibold">Missing allocated accessories</legend>{selectedReturnAllocation?.accessories.length ? <div className="grid gap-2">{selectedReturnAllocation.accessories.map((item) => <div key={item.id} className="flex items-center gap-2"><label className="flex flex-1 items-center gap-2 text-xs"><input type="checkbox" checked={Boolean(missing[item.id])} onChange={() => toggleMissing(item.id)} className="accent-sky-600" />{item.description} <span className="text-slate-400">({item.quantity} issued)</span></label>{missing[item.id] ? <Input aria-label={`${item.description} missing quantity`} type="number" min={1} max={item.quantity} value={missing[item.id]} onChange={(event) => setMissing((current) => ({ ...current, [item.id]: Math.min(item.quantity, Math.max(1, Number(event.target.value))) }))} className="h-8 w-20" /> : null}</div>)}</div> : <p className="text-xs text-slate-500">{selectedReturnAllocation ? "No accessories were issued with this allocation." : "Select an allocation to see its issued accessories."}</p>}</fieldset></div>
      <Field label="Additional remarks"><textarea value={returnRemarks} onChange={(event) => setReturnRemarks(event.target.value)} className={textAreaClass} placeholder="Enter any additional return remarks" /></Field><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={resetReturn}><RotateCcw className="size-4" />Reset</Button><Button type="submit" disabled={saving || !selectedReturnAllocation}><Check className="size-4" />{saving ? "Processing…" : "Process return"}</Button></div>
    </form></CardContent></Card><Card className="gap-3 border-0 shadow-none ring-1 ring-slate-200/80"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><ClipboardCheck className="size-5 text-sky-600" />Recent returns</CardTitle></CardHeader><CardContent><DashboardTable headers={["Return ID", "Equipment", "Description", "Returned by", "Return date", "Condition", "Missing accessories", "Received by"]} rows={returns.map((item) => [`#${item.id}`, item.equipment_number, item.equipment_description, item.technician_name, formatDate(item.returned_at), item.condition, item.missing_accessories.map((missingItem) => `${missingItem.description} ×${missingItem.quantity}`).join(", ") || "None", item.received_by_name])} minWidth="min-w-[950px]" /></CardContent></Card></section> :
    <section className="space-y-5"><Card className="gap-4 border-0 shadow-none ring-1 ring-slate-200/80"><CardHeader><CardTitle className="flex items-center gap-3 text-lg"><span className="flex size-10 items-center justify-center rounded-lg bg-sky-600 text-white"><ArrowLeftRight className="size-5" /></span>Equipment transfer request</CardTitle><p className="pl-[52px] text-xs text-muted-foreground">Receive the equipment first, then transfer it using its Return ID on the same day.</p></CardHeader><CardContent><form onSubmit={submitTransfer} className="space-y-5"><div className="grid gap-4 md:grid-cols-3">
      <Field label="Received return ID / equipment" required><select className={controlClass} required value={transferReturnId || ""} onChange={(event) => { const id = Number(event.target.value); setTransferReturnId(id); setToTechnicianId(0); }}><option value="">Select today&apos;s received return</option>{eligibleReturns.map((item) => <option key={item.id} value={item.id}>#{item.id} — {item.equipment_number} · {item.returning_from_name}</option>)}</select></Field><Field label="Previous custodian"><Input readOnly value={selectedTransferReturn?.technician_name ?? ""} className="h-10 bg-slate-50" placeholder="Derived from return" /></Field><Field label="Transfer date"><Input readOnly value={selectedTransferReturn ? formatDate(selectedTransferReturn.returned_at) : ""} className="h-10 bg-slate-50" placeholder="Same as return date" /></Field>
      <Field label="New custodian" required><select className={controlClass} required value={toTechnicianId || ""} onChange={(event) => setToTechnicianId(Number(event.target.value))}><option value="">Select technician</option>{references?.technicians.filter((item) => item.id !== selectedTransferReturn?.technician).map((item) => <option key={item.id} value={item.id}>{item.technician_number} — {item.name}</option>)}</select></Field><Field label="Project / Site"><Input readOnly value={selectedTransferReturn?.returning_from_name ?? ""} className="h-10 bg-slate-50" placeholder="Derived from return" /></Field><Field label="Reason for transfer" required><select className={controlClass} required value={reason} onChange={(event) => setReason(event.target.value)}><option value="">Select reason</option><option value="Project requirement">Project requirement</option><option value="Technician reassignment">Technician reassignment</option><option value="Site relocation">Site relocation</option><option value="Maintenance">Maintenance</option><option value="Other">Other</option></select></Field></div>
      <Field label="Transfer remarks"><textarea value={transferRemarks} onChange={(event) => setTransferRemarks(event.target.value)} className={textAreaClass} placeholder="Reason details or handover instructions" /></Field><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={resetTransfer}><RotateCcw className="size-4" />Reset</Button><Button type="submit" disabled={saving || !selectedTransferReturn}><ArrowLeftRight className="size-4" />{saving ? "Submitting…" : "Submit transfer"}</Button></div>
    </form></CardContent></Card><Card className="gap-3 border-0 shadow-none ring-1 ring-slate-200/80"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><ArrowLeftRight className="size-5 text-sky-600" />Transfer requests</CardTitle></CardHeader><CardContent><DashboardTable headers={["Transfer ID", "Equipment", "From", "To", "Project / Site", "Date", "Status", "Actions"]} rows={transfers.map((item) => [item.transfer_number, `${item.equipment_number} — ${item.equipment_description}`, item.from_technician_name, item.to_technician_name, item.project_site_name, formatDate(item.transfer_date), <StatusPill key={`status-${item.id}`} tone={item.status === "approved" ? "green" : item.status === "rejected" ? "red" : "amber"}>{item.status_name}</StatusPill>, item.status === "pending" ? <div key={`actions-${item.id}`} className="flex gap-1"><Button type="button" size="sm" disabled={reviewingId === item.id} onClick={() => void reviewTransfer(item, true)}><Check className="size-4" />Approve</Button><Button type="button" size="sm" variant="outline" disabled={reviewingId === item.id} onClick={() => void reviewTransfer(item, false)}><X className="size-4" />Reject</Button></div> : item.approved_by_name ?? "—"])} minWidth="min-w-[1050px]" /></CardContent></Card></section>}
  </div>;
}
