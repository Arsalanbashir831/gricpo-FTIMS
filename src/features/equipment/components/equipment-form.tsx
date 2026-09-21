"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Equipment, EquipmentReference } from "@/features/equipment/types";
import { authFetch } from "@/lib/api/client";

interface References { categories: EquipmentReference[]; statuses: EquipmentReference[] }

function messageFrom(payload: unknown) {
  if (!payload || typeof payload !== "object") return "Equipment could not be saved.";
  const data = payload as Record<string, unknown>;
  if (typeof data.detail === "string") return data.detail;
  const entry = Object.entries(data)[0];
  return entry && Array.isArray(entry[1]) ? `${entry[0]}: ${entry[1].join(" ")}` : "Equipment could not be saved.";
}

function Field({ label, name, children }: { label: string; name: string; children: React.ReactNode }) {
  return <label htmlFor={name} className="grid gap-1.5 text-sm font-medium text-slate-700">{label}{children}</label>;
}

export function EquipmentForm({ equipment }: { equipment?: Equipment }) {
  const router = useRouter();
  const [references, setReferences] = useState<References>({ categories: [], statuses: [] });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    authFetch("/api/equipment/references")
      .then(async (response) => {
        if (!response.ok) throw new Error();
        setReferences(await response.json());
      })
      .catch(() => setError("Equipment categories and statuses could not be loaded."));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = new FormData(event.currentTarget);
      if (!(body.get("photo") as File)?.size) body.delete("photo");
      const response = await authFetch(equipment ? `/api/equipment/${equipment.id}` : "/api/equipment", {
        method: equipment ? "PATCH" : "POST",
        body,
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        setError(messageFrom(payload));
        return;
      }
      const saved = payload as Equipment;
      router.push(`/supervisor/equipment/${saved.id}`);
      router.refresh();
    } catch {
      setError("The equipment service is unavailable.");
    } finally {
      setSaving(false);
    }
  }

  return <div className="space-y-5 p-4 sm:p-6 lg:p-7">
    <div>
      <Link href={equipment ? `/supervisor/equipment/${equipment.id}` : "/supervisor/equipment"} className="mb-3 inline-flex items-center gap-1 text-sm text-sky-700 hover:underline"><ArrowLeft className="size-4" /> Equipment list</Link>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{equipment ? "Edit equipment" : "Add new equipment"}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{equipment ? "Update this inventory record." : "Create an equipment inventory record."}</p>
    </div>
    <form onSubmit={submit} className="space-y-5">
      <Card className="border-0 shadow-none ring-1 ring-slate-200/80"><CardHeader><CardTitle>Equipment information</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
        <Field label="Equipment number" name="equipment_number"><Input id="equipment_number" name="equipment_number" required maxLength={40} defaultValue={equipment?.equipment_number} /></Field>
        <Field label="Serial number" name="serial_number"><Input id="serial_number" name="serial_number" required maxLength={100} defaultValue={equipment?.serial_number} /></Field>
        <Field label="Description" name="description"><Input id="description" name="description" required maxLength={255} defaultValue={equipment?.description} /></Field>
        <Field label="Category" name="category"><select id="category" name="category" required defaultValue={equipment?.category ?? ""} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"><option value="">Select category</option>{references.categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
        <Field label="Brand" name="brand"><Input id="brand" name="brand" required maxLength={100} defaultValue={equipment?.brand} /></Field>
        <Field label="Model" name="model"><Input id="model" name="model" required maxLength={100} defaultValue={equipment?.model} /></Field>
        <Field label="Status" name="status"><select id="status" name="status" required defaultValue={equipment?.status ?? "active"} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm">{references.statuses.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></Field>
        <Field label="Equipment photo" name="photo"><Input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" /></Field>
        <label htmlFor="notes" className="grid gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">Notes<textarea id="notes" name="notes" rows={4} maxLength={2000} defaultValue={equipment?.notes} className="rounded-lg border border-slate-200 bg-white p-3 text-sm" /></label>
      </CardContent></Card>
      {error ? <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      <div className="flex justify-end gap-2"><Button nativeButton={false} variant="outline" render={<Link href="/supervisor/equipment" />}>Cancel</Button><Button type="submit" disabled={saving || !references.categories.length}><Save className="size-4" />{saving ? "Saving…" : "Save equipment"}</Button></div>
    </form>
  </div>;
}
