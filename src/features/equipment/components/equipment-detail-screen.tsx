"use client";
/* eslint-disable @next/next/no-img-element -- backend media URLs are runtime values */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Pencil, QrCode, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCodeSvg } from "@/components/shared/qr-code";
import { StatusPill } from "@/components/shared/dashboard-widgets";
import type { Equipment } from "@/features/equipment/types";
import { equipmentDetailUrl } from "@/features/equipment/lib/equipment-detail-url";
import { usePageOrigin } from "@/hooks/use-page-origin";
import { authFetch } from "@/lib/api/client";

function displayDate(value: string | null) {
  if (!value) return "No calibration recorded";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export function EquipmentDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const origin = usePageOrigin();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    authFetch(`/api/equipment/${encodeURIComponent(id)}`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.detail);
        setEquipment(payload);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Equipment could not be loaded."));
  }, [id]);

  async function remove() {
    if (!equipment || !window.confirm(`Delete ${equipment.equipment_number}? This cannot be undone.`)) return;
    setDeleting(true);
    setError("");
    const response = await authFetch(`/api/equipment/${equipment.id}`, { method: "DELETE" });
    if (response.ok) {
      router.push("/supervisor/equipment");
      router.refresh();
      return;
    }
    const payload = await response.json().catch(() => null);
    setError(response.status === 409 ? "This equipment is referenced by another record and cannot be deleted." : payload?.detail ?? "Equipment could not be deleted.");
    setDeleting(false);
  }

  if (error && !equipment) return <div className="p-6"><p role="alert" className="text-sm text-destructive">{error}</p></div>;
  if (!equipment) return <p className="p-6 text-sm text-muted-foreground">Loading equipment…</p>;
  const detailUrl = origin ? equipmentDetailUrl(origin, equipment.qr_token) : "";
  const fields = [
    ["Equipment number", equipment.equipment_number], ["Serial number", equipment.serial_number],
    ["Category", equipment.category_name], ["Brand", equipment.brand], ["Model", equipment.model],
    ["Calibration due", displayDate(equipment.calibration_due)],
    ["Current site", equipment.current_allocation?.project_site_name ?? "Not allocated"],
    ["Custodian", equipment.current_allocation?.custodian_name ?? "Store"],
  ];

  return <div className="space-y-5 p-4 sm:p-6 lg:p-7">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><Link href="/supervisor/equipment" className="mb-3 inline-flex items-center gap-1 text-sm text-sky-700 hover:underline"><ArrowLeft className="size-4" /> Equipment list</Link><div className="flex items-center gap-3"><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{equipment.description}</h1><StatusPill tone={equipment.status === "active" ? "green" : equipment.status === "maintenance" ? "amber" : "red"}>{equipment.status_name}</StatusPill></div><p className="mt-1 font-mono text-sm text-muted-foreground">{equipment.equipment_number}</p></div>
      <div className="flex gap-2"><Button nativeButton={false} variant="outline" render={<Link href={`/supervisor/equipment/${equipment.id}/edit`} />}><Pencil className="size-4" /> Edit</Button><Button type="button" variant="destructive" onClick={() => void remove()} disabled={deleting}><Trash2 className="size-4" />{deleting ? "Deleting…" : "Delete"}</Button></div>
    </div>
    {error ? <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <Card className="border-0 ring-1 ring-slate-200/80"><CardHeader><CardTitle>Equipment photo</CardTitle></CardHeader><CardContent><div className="flex aspect-[16/9] items-center justify-center overflow-hidden rounded-lg border bg-slate-50">{equipment.photo ? <img src={equipment.photo} alt={equipment.description} className="size-full object-contain" /> : <div className="text-center text-slate-400"><Camera className="mx-auto size-10" /><p className="mt-2 text-sm">No photo added</p></div>}</div></CardContent></Card>
        <Card className="border-0 ring-1 ring-slate-200/80"><CardHeader><CardTitle>Equipment information</CardTitle></CardHeader><CardContent><dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">{fields.map(([label, value]) => <div key={label} className="border-b border-slate-100 pb-3"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 text-sm font-medium">{value}</dd></div>)}</dl>{equipment.notes ? <div className="mt-5"><h3 className="text-xs text-muted-foreground">Notes</h3><p className="mt-1 whitespace-pre-wrap text-sm">{equipment.notes}</p></div> : null}</CardContent></Card>
      </div>
      <Card className="border-0 ring-1 ring-slate-200/80 xl:sticky xl:top-20"><CardHeader><CardTitle>Equipment QR code</CardTitle></CardHeader><CardContent className="space-y-3"><div className="flex min-h-56 items-center justify-center rounded-lg border bg-white p-4">{detailUrl ? <QrCodeSvg value={detailUrl} className="size-48" /> : <QrCode className="size-10 text-slate-300" />}</div><p className="break-all rounded-lg bg-slate-50 p-2 font-mono text-xs">{detailUrl || "Loading detail URL…"}</p><p className="text-xs text-muted-foreground">Backend QR token: {equipment.qr_token}</p></CardContent></Card>
    </div>
  </div>;
}
