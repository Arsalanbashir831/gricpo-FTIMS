import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EquipmentOption } from "@/features/maintenance/types";

export const selectClassName = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-sky-500";
export const textareaClassName = "w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-sky-500";

export function MaintenanceFormPage({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <div className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6 lg:p-7"><div><Link href="/supervisor/maintenance" className="mb-3 inline-flex items-center gap-1 text-sm text-sky-700 hover:underline"><ArrowLeft className="size-4" /> Maintenance stats</Link><div className="flex items-center gap-3"><Wrench className="size-8 text-sky-700" /><div><h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{description}</p></div></div></div>{children}</div>;
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return <Card className="border-0 shadow-none ring-1 ring-slate-200/80"><CardHeader><CardTitle className="text-base font-semibold text-slate-900">{title}</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">{children}</CardContent></Card>;
}

export function FormField({ label, name, children, full = false }: { label: string; name: string; children: ReactNode; full?: boolean }) {
  return <label htmlFor={name} className={`grid gap-1.5 text-sm font-medium text-slate-700 ${full ? "sm:col-span-2" : ""}`}>{label}{children}</label>;
}

export function EquipmentSelect({ equipment, defaultValue }: { equipment: EquipmentOption[]; defaultValue?: number }) {
  return <FormField label="Equipment *" name="equipment"><select id="equipment" name="equipment" required defaultValue={defaultValue ?? ""} className={selectClassName}><option value="" disabled>Select equipment</option>{equipment.map((item) => <option key={item.id} value={item.id}>{item.equipment_number} – {item.description}</option>)}</select></FormField>;
}

export function FormActions({ saving, editing }: { saving: boolean; editing: boolean }) {
  return <div className="flex flex-wrap justify-end gap-2"><Button nativeButton={false} variant="outline" render={<Link href="/supervisor/maintenance" />}>Cancel</Button><Button type="submit" disabled={saving}><Save className="size-4" /> {saving ? "Saving…" : editing ? "Save changes" : "Create record"}</Button></div>;
}

export function formText(form: FormData, key: string) { return String(form.get(key) ?? "").trim(); }
