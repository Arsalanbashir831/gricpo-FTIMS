"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Calibration } from "@/features/calibration/types";
import { authFetch, downloadAuthenticatedFile } from "@/lib/api/client";

function date(value: string) { return new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)); }

export function CalibrationDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const [record, setRecord] = useState<Calibration | null>(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  useEffect(() => { authFetch(`/api/calibrations/${id}`).then(async (response) => {
    const payload = await response.json(); if (!response.ok) throw new Error(payload.detail); setRecord(payload);
  }).catch((reason) => setError(reason instanceof Error ? reason.message : "Calibration could not be loaded.")); }, [id]);
  async function remove() {
    if (!record || !window.confirm(`Delete certificate ${record.certificate_number}? This cannot be undone.`)) return;
    setDeleting(true); const response = await authFetch(`/api/calibrations/${record.id}`, { method: "DELETE" });
    if (response.ok) { router.push("/supervisor/calibration"); router.refresh(); return; }
    const payload = await response.json().catch(() => null); setError(response.status === 409 ? "This calibration is referenced by another record and cannot be deleted." : payload?.detail ?? "Calibration could not be deleted."); setDeleting(false);
  }
  if (error && !record) return <p role="alert" className="p-6 text-sm text-destructive">{error}</p>;
  if (!record) return <p className="p-6 text-sm text-muted-foreground">Loading calibration…</p>;
  const fields = [["Equipment", `${record.equipment_number} · ${record.equipment_description}`], ["Category", record.equipment_category], ["Certificate number", record.certificate_number], ["Calibration date", date(record.calibration_date)], ["Due date", date(record.due_date)], ["Provider", record.provider || "Not recorded"], ["Validity", record.validity_status.replace("_", " ")], ["Revoked", record.revoked ? "Yes" : "No"]];
  return <div className="space-y-5 p-4 sm:p-6 lg:p-7"><div className="flex flex-wrap items-start justify-between gap-3"><div><Link href="/supervisor/calibration" className="mb-3 inline-flex items-center gap-1 text-sm text-sky-700 hover:underline"><ArrowLeft className="size-4" /> Calibration</Link><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{record.certificate_number}</h1><p className="mt-1 text-sm text-muted-foreground">{record.equipment_number} · {record.equipment_description}</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => void downloadAuthenticatedFile(`/api/calibrations/${record.id}/certificate`, `${record.certificate_number}.pdf`)}><Download className="size-4" /> Download PDF</Button><Button nativeButton={false} variant="outline" render={<Link href={`/supervisor/calibration/${record.id}/edit`} />}><Pencil className="size-4" /> Edit</Button><Button variant="destructive" onClick={() => void remove()} disabled={deleting}><Trash2 className="size-4" />{deleting ? "Deleting…" : "Delete"}</Button></div></div>{error ? <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}<Card className="border-0 ring-1 ring-slate-200/80"><CardHeader><CardTitle>Calibration details</CardTitle></CardHeader><CardContent><dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">{fields.map(([label, value]) => <div key={label} className="border-b pb-3"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 text-sm font-medium capitalize">{value}</dd></div>)}</dl>{record.notes ? <div className="mt-5"><h3 className="text-xs text-muted-foreground">Notes</h3><p className="mt-1 whitespace-pre-wrap text-sm">{record.notes}</p></div> : null}</CardContent></Card></div>;
}
