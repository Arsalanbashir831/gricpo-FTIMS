"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileUp, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Calibration, CalibrationEquipmentOption } from "@/features/calibration/types";
import { authFetch } from "@/lib/api/client";

function errorMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") return "Calibration could not be saved.";
  const data = payload as Record<string, unknown>;
  if (typeof data.detail === "string") return data.detail;
  const entry = Object.entries(data)[0];
  return entry && Array.isArray(entry[1]) ? `${entry[0]}: ${entry[1].join(" ")}` : "Calibration could not be saved.";
}

function Field({ label, name, children }: { label: string; name: string; children: React.ReactNode }) {
  return <label htmlFor={name} className="grid gap-1.5 text-sm font-medium text-slate-700">{label}{children}</label>;
}

export function CalibrationForm({ calibration }: { calibration?: Calibration }) {
  const router = useRouter();
  const [equipment, setEquipment] = useState<CalibrationEquipmentOption[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    authFetch("/api/calibrations/references").then(async (response) => {
      if (!response.ok) throw new Error();
      setEquipment((await response.json()).equipment);
    }).catch(() => setError("Equipment options could not be loaded."));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError("");
    const body = new FormData(event.currentTarget);
    const certificate = body.get("certificate") as File | null;
    if (!certificate?.size) body.delete("certificate");
    body.set("revoked", body.get("revoked") ? "true" : "false");
    try {
      const response = await authFetch(calibration ? `/api/calibrations/${calibration.id}` : "/api/calibrations", {
        method: calibration ? "PATCH" : "POST", body,
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) { setError(errorMessage(payload)); return; }
      router.push(`/supervisor/calibration/${(payload as Calibration).id}`); router.refresh();
    } catch { setError("The calibration service is unavailable."); }
    finally { setSaving(false); }
  }

  return <div className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6 lg:p-7">
    <div><Link href="/supervisor/calibration" className="mb-3 inline-flex items-center gap-1 text-sm text-sky-700 hover:underline"><ArrowLeft className="size-4" /> Calibration</Link><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{calibration ? "Edit calibration" : "Add calibration record"}</h1><p className="mt-1 text-sm text-muted-foreground">Record the schedule, provider, and PDF certificate for an equipment item.</p></div>
    <form onSubmit={submit} className="space-y-5">
      <Card className="border-0 ring-1 ring-slate-200/80"><CardHeader><CardTitle>Calibration information</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
        <Field label="Equipment" name="equipment"><select id="equipment" name="equipment" required defaultValue={calibration?.equipment ?? ""} className="h-10 rounded-lg border bg-white px-3 text-sm"><option value="">Select equipment</option>{equipment.map((item) => <option key={item.id} value={item.id}>{item.equipment_number} · {item.description}</option>)}</select></Field>
        <Field label="Certificate number" name="certificate_number"><Input id="certificate_number" name="certificate_number" required maxLength={100} defaultValue={calibration?.certificate_number} /></Field>
        <Field label="Calibration date" name="calibration_date"><Input id="calibration_date" name="calibration_date" type="date" required defaultValue={calibration?.calibration_date} /></Field>
        <Field label="Due date" name="due_date"><Input id="due_date" name="due_date" type="date" required defaultValue={calibration?.due_date} /></Field>
        <Field label="Provider" name="provider"><Input id="provider" name="provider" maxLength={200} defaultValue={calibration?.provider} placeholder="Calibration laboratory or provider" /></Field>
        <Field label={calibration ? "Replace PDF certificate (optional)" : "PDF certificate"} name="certificate"><span className="relative"><FileUp className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" /><Input id="certificate" name="certificate" type="file" accept="application/pdf,.pdf" required={!calibration} className="pl-10" /></span></Field>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input name="revoked" type="checkbox" defaultChecked={calibration?.revoked} className="size-4 accent-primary" /> Mark certificate as revoked</label>
        <label htmlFor="notes" className="grid gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">Notes<textarea id="notes" name="notes" rows={4} maxLength={2000} defaultValue={calibration?.notes} className="rounded-lg border bg-white p-3 text-sm" /></label>
      </CardContent></Card>
      {error ? <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      <div className="flex justify-end gap-2"><Button nativeButton={false} variant="outline" render={<Link href="/supervisor/calibration" />}>Cancel</Button><Button type="submit" disabled={saving || !equipment.length}><Save className="size-4" />{saving ? "Saving…" : "Save calibration"}</Button></div>
    </form>
  </div>;
}
