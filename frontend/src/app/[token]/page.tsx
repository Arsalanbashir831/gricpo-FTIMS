import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Download, ExternalLink, FileText, MapPin, ShieldCheck, UserRound } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PublicTechnician } from "@/features/technicians/types";
import { apiEndpoints } from "@/lib/api/endpoints";
import { ApiError, apiRequest } from "@/lib/api/server";

interface PageProps { params: Promise<{ token: string }> }

async function getTechnician(token: string) {
  try {
    return await apiRequest<PublicTechnician>(apiEndpoints.publicTechnician(token));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const technician = await getTechnician((await params).token);
  return { title: `${technician.name} · Technician profile` };
}

function value(value: string | null | undefined) { return value?.trim() || "Not provided"; }

export default async function PublicTechnicianPage({ params }: PageProps) {
  const token = (await params).token;
  const technician = await getTechnician(token);
  const backendBase = (process.env.API_BASE_URL ?? "").replace(/\/+$/, "");
  const photoUrl = `${backendBase}/public/technicians/${encodeURIComponent(token)}/photo`;
  const resumeUrl = `${backendBase}/public/technicians/${encodeURIComponent(token)}/resume`;
  const fields = [
    ["Technician number", technician.technician_number],
    ["Discipline", technician.discipline],
    ["Qualification", value(technician.qualification)],
    ["Iqama number", value(technician.iqama_no)],
    ["Contact number", value(technician.contact)],
    ["Email", value(technician.email)],
    ["Location", value(technician.location)],
    ["Certification expiry", value(technician.certification_expiry)],
  ];

  return <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:py-16">
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-sky-100 text-sky-700"><UserRound className="size-7" aria-hidden="true" /></div>
        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">Public technician profile</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{technician.name}</h1>
        <p className="mt-2 font-mono text-sm text-slate-500">{technician.technician_number}</p>
      </header>
      <Card className="border-0 shadow-sm ring-1 ring-slate-200">
        <CardHeader className="border-b border-slate-100"><CardTitle className="flex items-center gap-2"><ShieldCheck className="size-5 text-emerald-600" /> Technician details</CardTitle></CardHeader>
        <CardContent><form className="grid gap-4 sm:grid-cols-2" aria-label="Public technician profile"><div className="sm:col-span-2"><label className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500" htmlFor="public-technician-name">Full name<input id="public-technician-name" readOnly value={technician.name} className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold normal-case tracking-normal text-slate-900" /></label></div>{fields.map(([label, item]) => { const id = `public-${label.toLowerCase().replaceAll(" ", "-")}`; return <label key={label} className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500" htmlFor={id}>{label}<input id={id} readOnly value={item} className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold normal-case tracking-normal text-slate-900" /></label>; })}<label className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500 sm:col-span-2" htmlFor="public-technician-skills">Skills<textarea id="public-technician-skills" readOnly value={value(technician.skills)} rows={3} className="resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold normal-case tracking-normal text-slate-900" /></label></form></CardContent>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2">
        <a href={photoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl bg-white p-4 text-sm font-semibold text-sky-700 ring-1 ring-slate-200 hover:bg-sky-50"><ExternalLink className="size-5" />View profile photo</a>
        <a href={resumeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl bg-white p-4 text-sm font-semibold text-sky-700 ring-1 ring-slate-200 hover:bg-sky-50"><Download className="size-5" />Download resume</a>
      </div>
      <p className="flex items-center justify-center gap-2 text-center text-xs text-slate-500"><MapPin className="size-3.5" />Public information retrieved from GRIPCO FTIMS</p>
    </div>
  </main>;
}
