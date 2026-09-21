/* eslint-disable @next/next/no-img-element -- public media URL is supplied at runtime */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BadgeCheck, CalendarClock, Gauge, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PublicEquipment } from "@/features/equipment/types";
import { apiEndpoints } from "@/lib/api/endpoints";
import { ApiError, apiRequest } from "@/lib/api/server";

interface PageProps {
  params: Promise<{ token: string }>;
}

async function getEquipment(token: string) {
  try {
    return await apiRequest<PublicEquipment>(
      apiEndpoints.publicEquipment(token),
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const equipment = await getEquipment((await params).token);
  return { title: `${equipment.equipment_number} · Equipment verification` };
}

function displayDate(value: string | null) {
  if (!value) return "No calibration recorded";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export default async function PublicEquipmentPage({ params }: PageProps) {
  const equipment = await getEquipment((await params).token);
  const fields = [
    ["Equipment number", equipment.equipment_number],
    ["Description", equipment.description],
    ["Category", equipment.category_name],
    ["Brand", equipment.brand],
    ["Model", equipment.model],
    ["Serial number", equipment.serial_number],
    ["Status", equipment.status_name],
    ["Calibration due", displayDate(equipment.calibration_due)],
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <ShieldCheck className="size-7" aria-hidden="true" />
          </div>
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Verified equipment record
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {equipment.description}
          </h1>
          <p className="mt-2 font-mono text-sm text-slate-500">
            {equipment.equipment_number}
          </p>
        </header>

        <Card className="border-0 shadow-sm ring-1 ring-slate-200">
          {equipment.photo ? (
            <div className="flex aspect-[16/9] max-h-96 items-center justify-center overflow-hidden rounded-t-xl bg-white">
              <img
                src={equipment.photo}
                alt={equipment.description}
                className="size-full object-contain"
              />
            </div>
          ) : null}
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <Gauge className="size-5 text-sky-700" /> Equipment details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {fields.map(([label, value]) => (
                <div key={label} className="border-b border-slate-100 pb-4">
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {label}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl bg-white p-4 ring-1 ring-slate-200">
            <BadgeCheck className="size-5 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Record verified
              </p>
              <p className="text-xs text-slate-500">
                Retrieved directly from FTIMS
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white p-4 ring-1 ring-slate-200">
            <CalendarClock className="size-5 text-sky-700" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Calibration
              </p>
              <p className="text-xs text-slate-500">
                {displayDate(equipment.calibration_due)}
              </p>
            </div>
          </div>
        </div>

        <footer className="text-center text-xs text-slate-500">
          GRIPCO Field Testing and Inspection Management System ·{" "}
          <Link
            href="/login"
            className="font-medium text-sky-700 hover:underline"
          >
            Staff sign in
          </Link>
        </footer>
      </div>
    </main>
  );
}
