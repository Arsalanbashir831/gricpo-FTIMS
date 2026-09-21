"use client";

import { useState, useEffect, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProjectMap } from "@/features/projects/components/project-map";
import { LocationPicker } from "@/features/projects/components/location-picker";
import type { LocationSearchResult, ProjectStatus, ClientReference } from "@/features/projects/types";
import { authFetch } from "@/lib/api/client";

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: "planned", label: "Planned" },
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="border-0 shadow-none ring-1 ring-slate-200/80">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-slate-900">
          <h2>{title}</h2>
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Field({ label, name, required, children }: { label: string; name: string; required?: boolean; children: ReactNode }) {
  return (
    <label htmlFor={name} className="grid gap-1.5 text-sm font-medium text-slate-700">
      {label} {required && <span className="text-rose-500 font-bold">*</span>}
      {children}
    </label>
  );
}

export function AddProjectScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [clientTitle, setClientTitle] = useState("");
  const [location, setLocation] = useState<LocationSearchResult | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("planned");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // References from backend
  const [existingClients, setExistingClients] = useState<ClientReference[]>([]);

  useEffect(() => {
    async function loadRefs() {
      try {
        const res = await authFetch("/api/projects/references");
        if (res.ok) {
          const data = await res.json();
          if (data.clients) {
            setExistingClients(data.clients);
          }
        }
      } catch (err) {
        console.error("Failed to load project references:", err);
      }
    }
    loadRefs();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Please provide a project name.");
      return;
    }
    if (!clientTitle.trim()) {
      setError("Please provide or select a client.");
      return;
    }
    if (endDate && startDate && endDate < startDate) {
      setError("End Date must be on or after Start Date.");
      return;
    }
    if (!location) {
      setError("Search for a site location and confirm it before saving.");
      return;
    }
    setError("");
    setSaving(true);

    try {
      // Build location string storing both label and coordinates for full persistence
      const locationFormatted = `${location.label} (lat:${location.latitude}, lng:${location.longitude})`;

      const payload = {
        name: name.trim(),
        client_title: clientTitle.trim(),
        status,
        start_date: startDate || null,
        end_date: endDate || null,
        location: locationFormatted,
      };

      const res = await authFetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.error || errData.detail || JSON.stringify(errData);
        throw new Error(errMsg || `HTTP error ${res.status}`);
      }

      router.push("/supervisor/projects");
    } catch (err: any) {
      setError(err?.message || "The project could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 p-4 sm:p-6 lg:p-7">
      <div>
        <Link
          href="/supervisor/projects"
          className="mb-3 inline-flex items-center gap-1 text-sm text-sky-700 hover:underline"
        >
          <ArrowLeft className="size-4" /> Back to Projects / Sites
        </Link>
        <div className="flex items-center gap-3">
          <MapPin className="size-8 text-sky-700" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Add New Project</h1>
            <p className="mt-1 text-sm text-slate-500">
              Create a new client site project. Equipment and technician allocations can be assigned once created.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <Section title="Project Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Project / Site Name" name="name" required>
                <Input
                  id="name"
                  name="name"
                  required
                  maxLength={150}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ras Tanura Refinery Site A"
                  className="h-10"
                />
              </Field>

              <Field label="Client" name="client" required>
                <div className="relative">
                  <Input
                    id="client"
                    name="client"
                    list="client-suggestions"
                    required
                    maxLength={150}
                    value={clientTitle}
                    onChange={(e) => setClientTitle(e.target.value)}
                    placeholder="e.g. Saudi Aramco"
                    className="h-10"
                  />
                  <datalist id="client-suggestions">
                    {existingClients.map((c) => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                </div>
              </Field>

              <Field label="Status" name="status" required>
                <select
                  id="status"
                  name="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </Section>

          <Section title="Site Location (Map & Coordinates)">
            <LocationPicker value={location} onChange={setLocation} />
          </Section>

          <Section title="Schedule Timeline">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Start Date" name="startDate">
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-10"
                />
              </Field>
              <Field label="End Date" name="endDate">
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  min={startDate || undefined}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-10"
                />
              </Field>
            </div>
          </Section>

          {error && (
            <div role="alert" className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <Button nativeButton={false} variant="outline" render={<Link href="/supervisor/projects" />}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="size-4" /> {saving ? "Creating Project…" : "Save Project"}
            </Button>
          </div>
        </div>

        <div className="space-y-5 xl:sticky xl:top-20">
          <Section title="Location Preview">
            <ProjectMap latitude={location?.latitude} longitude={location?.longitude} name={name || "New Site Location"} />
            <p className="mt-2 text-xs text-slate-400">Map via OpenStreetMap</p>
          </Section>

          <Section title="Summary Preview">
            <dl className="space-y-3 text-xs">
              <div className="grid grid-cols-[100px_1fr] gap-2 border-b border-slate-100 pb-2">
                <dt className="text-slate-400 font-medium">Project</dt>
                <dd className="font-semibold text-slate-800">{name || "—"}</dd>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2 border-b border-slate-100 pb-2">
                <dt className="text-slate-400 font-medium">Client</dt>
                <dd className="font-semibold text-slate-800">{clientTitle || "—"}</dd>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2 border-b border-slate-100 pb-2">
                <dt className="text-slate-400 font-medium">Location</dt>
                <dd className="font-medium text-slate-700 truncate">{location ? location.label : "—"}</dd>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2 border-b border-slate-100 pb-2">
                <dt className="text-slate-400 font-medium">Status</dt>
                <dd className="font-semibold uppercase text-slate-800">{status}</dd>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2 border-b border-slate-100 pb-2">
                <dt className="text-slate-400 font-medium">Timeline</dt>
                <dd className="font-medium text-slate-700">
                  {startDate || "—"} to {endDate || "—"}
                </dd>
              </div>
            </dl>
          </Section>
        </div>
      </form>
    </div>
  );
}
