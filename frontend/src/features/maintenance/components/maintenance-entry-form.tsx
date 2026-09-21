"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { EquipmentSelect, FormActions, FormField, FormSection, MaintenanceFormPage, formText, selectClassName, textareaClassName } from "@/features/maintenance/components/maintenance-form-fields";
import type { FaultReport, MaintenanceReferences, MaintenanceRequest, ServiceReport } from "@/features/maintenance/types";
import { authFetch } from "@/lib/api/client";

export type MaintenanceKind = "request" | "fault" | "service";
type Existing = MaintenanceRequest | FaultReport | ServiceReport;
const pageCopy: Record<MaintenanceKind, { create: string; edit: string; description: string }> = {
  request: { create: "New maintenance request", edit: "Edit maintenance request", description: "Record an equipment issue and the action needed." },
  fault: { create: "New fault report", edit: "Edit fault report", description: "Document a fault found during use or inspection." },
  service: { create: "New service report", edit: "Edit service report", description: "Record repair work, cost, downtime, and the service result." },
};
const endpoints: Record<MaintenanceKind, string> = { request: "/api/maintenance/requests", fault: "/api/maintenance/fault-reports", service: "/api/maintenance/service-reports" };
const faultTypes = [["electrical_power", "Electrical / power"], ["mechanical", "Mechanical"], ["software_firmware", "Software / firmware"], ["calibration_related", "Calibration related"], ["physical_damage", "Physical damage"], ["accessories_cables", "Accessories / cables"], ["other", "Other"]] as const;

function dateValue(value?: string | null) { return value ? value.slice(0, 10) : ""; }
function durationFromHours(hours: number) {
  const totalMinutes = Math.round(hours * 60); const days = Math.floor(totalMinutes / 1440); const remaining = totalMinutes % 1440;
  return `${days} ${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}:00`;
}
function message(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") { const first = Object.values(payload as Record<string, unknown>)[0]; if (typeof first === "string") return first; if (Array.isArray(first) && typeof first[0] === "string") return first[0]; }
  return fallback;
}

export function MaintenanceEntryForm({ kind, recordId }: { kind: MaintenanceKind; recordId?: string }) {
  const router = useRouter();
  const [references, setReferences] = useState<MaintenanceReferences | null>(null);
  const [existing, setExisting] = useState<Existing | null>(null);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([authFetch("/api/maintenance/references"), recordId ? authFetch(`${endpoints[kind]}/${recordId}`) : Promise.resolve(null)]).then(async ([referenceResponse, recordResponse]) => {
      const referencePayload = await referenceResponse.json().catch(() => ({}));
      if (!referenceResponse.ok) throw new Error(message(referencePayload, "Maintenance form options could not be loaded."));
      let record: Existing | null = null;
      if (recordResponse) { const payload = await recordResponse.json().catch(() => ({})); if (!recordResponse.ok) throw new Error(message(payload, "The maintenance record could not be loaded.")); record = payload as Existing; }
      if (active) { setReferences(referencePayload as MaintenanceReferences); setExisting(record); }
    }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "The form could not be loaded."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [kind, recordId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError("");
    const form = new FormData(event.currentTarget); const text = (key: string) => formText(form, key); let payload: Record<string, unknown>;
    if (kind === "request") {
      if (text("target_date") && text("target_date") < text("requested_at")) { setError("Target date must be on or after the request date."); setSaving(false); return; }
      payload = { equipment: Number(text("equipment")), description: text("description"), fault_type: text("fault_type"), requested_at: `${text("requested_at")}T12:00:00Z`, target_date: text("target_date") || null, priority: text("priority"), status: text("status"), notes: text("notes") };
    } else if (kind === "fault") {
      payload = { equipment: Number(text("equipment")), description: text("description"), fault_type: text("fault_type"), reported_at: `${text("reported_at")}T12:00:00Z`, priority: text("priority"), status: text("status"), observations: text("observations") };
    } else {
      const cost = Number(text("cost_usd")); const downtimeHours = Number(text("downtime_hours"));
      if (!Number.isFinite(cost) || cost < 0 || !Number.isFinite(downtimeHours) || downtimeHours < 0) { setError("Cost and downtime must be zero or greater."); setSaving(false); return; }
      payload = { equipment: Number(text("equipment")), maintenance_request: text("maintenance_request") ? Number(text("maintenance_request")) : null, service_type: text("service_type"), service_date: text("service_date"), provider: text("provider"), cost_usd: cost.toFixed(2), downtime: durationFromHours(downtimeHours), result: text("result"), work_performed: text("work_performed"), parts_replaced: text("parts_replaced"), notes: text("notes") };
    }
    try {
      const response = await authFetch(recordId ? `${endpoints[kind]}/${recordId}` : endpoints[kind], { method: recordId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const responsePayload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(message(responsePayload, "The record could not be saved."));
      router.push("/supervisor/maintenance"); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The record could not be saved."); setSaving(false); }
  }

  const copy = pageCopy[kind];
  if (loading) return <MaintenanceFormPage title={recordId ? copy.edit : copy.create} description={copy.description}><p className="rounded-lg bg-white p-6 text-sm text-slate-500 ring-1 ring-slate-200">Loading form…</p></MaintenanceFormPage>;
  if (!references) return <MaintenanceFormPage title={recordId ? copy.edit : copy.create} description={copy.description}><p role="alert" className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">{error}</p></MaintenanceFormPage>;
  const request = kind === "request" ? existing as MaintenanceRequest | null : null; const fault = kind === "fault" ? existing as FaultReport | null : null; const service = kind === "service" ? existing as ServiceReport | null : null; const today = new Date().toISOString().slice(0, 10);
  return <MaintenanceFormPage title={recordId ? copy.edit : copy.create} description={copy.description}>
    <form onSubmit={submit} className="space-y-5">
      <FormSection title="Equipment & classification">
        <EquipmentSelect equipment={references.equipment} defaultValue={existing?.equipment} />
        {kind === "service" ? <FormField label="Service type *" name="service_type"><select id="service_type" name="service_type" required defaultValue={service?.service_type ?? ""} className={selectClassName}><option value="" disabled>Select service type</option>{references.serviceTypes.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></FormField> : <FormField label="Fault type *" name="fault_type"><select id="fault_type" name="fault_type" required defaultValue={request?.fault_type ?? fault?.fault_type ?? "other"} className={selectClassName}>{faultTypes.map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></FormField>}
        {kind !== "service" ? <FormField label="Priority *" name="priority"><select id="priority" name="priority" required defaultValue={request?.priority ?? fault?.priority ?? "normal"} className={selectClassName}>{references.priorities.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></FormField> : null}
        {kind === "request" ? <FormField label="Status *" name="status"><select id="status" name="status" required defaultValue={request?.status ?? "open"} className={selectClassName}>{references.maintenanceStatuses.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></FormField> : null}
        {kind === "fault" ? <FormField label="Status *" name="status"><select id="status" name="status" required defaultValue={fault?.status ?? "open"} className={selectClassName}>{references.faultStatuses.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></FormField> : null}
      </FormSection>
      {kind === "request" ? <FormSection title="Maintenance request details"><FormField label="Fault / issue description *" name="description" full><Input id="description" name="description" required maxLength={1000} defaultValue={request?.description} /></FormField><FormField label="Request date *" name="requested_at"><Input id="requested_at" name="requested_at" type="date" required defaultValue={dateValue(request?.requested_at) || today} /></FormField><FormField label="Target date" name="target_date"><Input id="target_date" name="target_date" type="date" defaultValue={dateValue(request?.target_date)} /></FormField><FormField label="Notes" name="notes" full><textarea id="notes" name="notes" rows={4} maxLength={2000} defaultValue={request?.notes} className={textareaClassName} /></FormField></FormSection> : null}
      {kind === "fault" ? <FormSection title="Fault report details"><FormField label="Fault description *" name="description" full><Input id="description" name="description" required maxLength={1000} defaultValue={fault?.description} /></FormField><FormField label="Report date *" name="reported_at"><Input id="reported_at" name="reported_at" type="date" required defaultValue={dateValue(fault?.reported_at) || today} /></FormField><FormField label="Observations" name="observations" full><textarea id="observations" name="observations" rows={4} maxLength={2000} defaultValue={fault?.observations} className={textareaClassName} /></FormField></FormSection> : null}
      {kind === "service" ? <FormSection title="Service report details"><FormField label="Related maintenance request" name="maintenance_request"><select id="maintenance_request" name="maintenance_request" defaultValue={service?.maintenance_request ?? ""} className={selectClassName}><option value="">None</option>{references.maintenanceRequests.map((item) => <option key={item.id} value={item.id}>{item.request_number}</option>)}</select></FormField><FormField label="Service date *" name="service_date"><Input id="service_date" name="service_date" type="date" required defaultValue={service?.service_date ?? today} /></FormField><FormField label="Vendor / provider *" name="provider"><Input id="provider" name="provider" required maxLength={200} defaultValue={service?.provider} /></FormField><FormField label="Cost (USD) *" name="cost_usd"><Input id="cost_usd" name="cost_usd" type="number" required min={0} step="0.01" defaultValue={service?.cost_usd} /></FormField><FormField label="Downtime (hours) *" name="downtime_hours"><Input id="downtime_hours" name="downtime_hours" type="number" required min={0} step="0.25" defaultValue={service?.downtime_hours ?? 0} /></FormField><FormField label="Result *" name="result"><select id="result" name="result" required defaultValue={service?.result ?? "successful"} className={selectClassName}>{references.serviceResults.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></FormField><FormField label="Work performed *" name="work_performed" full><textarea id="work_performed" name="work_performed" rows={4} required maxLength={2000} defaultValue={service?.work_performed} className={textareaClassName} /></FormField><FormField label="Parts replaced" name="parts_replaced" full><Input id="parts_replaced" name="parts_replaced" maxLength={500} defaultValue={service?.parts_replaced} /></FormField><FormField label="Notes" name="notes" full><textarea id="notes" name="notes" rows={3} maxLength={2000} defaultValue={service?.notes} className={textareaClassName} /></FormField></FormSection> : null}
      {error ? <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}<FormActions saving={saving} editing={Boolean(recordId)} />
    </form>
  </MaintenanceFormPage>;
}
