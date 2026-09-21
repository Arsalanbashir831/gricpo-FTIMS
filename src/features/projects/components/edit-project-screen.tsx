"use client";

import { useState, useEffect, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProjectMap } from "@/features/projects/components/project-map";
import { LocationPicker } from "@/features/projects/components/location-picker";
import type { LocationSearchResult, ProjectStatus, ClientReference, ProjectSite } from "@/features/projects/types";
import { extractCoordinates } from "@/features/projects/components/supervisor-projects";
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

export function EditProjectScreen({ projectId }: { projectId: string | number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [clientTitle, setClientTitle] = useState("");
  const [location, setLocation] = useState<LocationSearchResult | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("planned");
  const [equipmentCount, setEquipmentCount] = useState(0);
  const [technicians, setTechnicians] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // References
  const [existingClients, setExistingClients] = useState<ClientReference[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [refRes, projRes] = await Promise.all([
          authFetch("/api/projects/references"),
          authFetch(`/api/projects/${projectId}`),
        ]);

        if (refRes.ok) {
          const refData = await refRes.json();
          if (refData.clients) setExistingClients(refData.clients);
        }

        if (projRes.ok) {
          const proj: ProjectSite = await projRes.json();
          setName(proj.name || "");
          setClientTitle(proj.client_name || "");
          setStatus(proj.status || "planned");
          setStartDate(proj.start_date || "");
          setEndDate(proj.end_date || "");
          setEquipmentCount(proj.equipment_count || 0);
          setTechnicians(proj.technician_names || []);

          if (proj.location) {
            const parsed = extractCoordinates(proj.location);
            if (parsed.latitude !== undefined && parsed.longitude !== undefined) {
              setLocation({
                id: "initial",
                label: parsed.label || proj.location,
                city: parsed.label.split(",")[0] || "",
                country: "",
                latitude: parsed.latitude,
                longitude: parsed.longitude,
              });
            } else {
              setLocation({
                id: "initial",
                label: proj.location,
                city: "",
                country: "",
                latitude: 24.7136,
                longitude: 46.6753,
              });
            }
          }
        } else {
          setError("Failed to load project details.");
        }
      } catch (err) {
        console.error("Error loading project data:", err);
        setError("Error loading project data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [projectId]);

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
      const locationFormatted = `${location.label} (lat:${location.latitude}, lng:${location.longitude})`;

      const payload = {
        name: name.trim(),
        client_title: clientTitle.trim(),
        status,
        start_date: startDate || null,
        end_date: endDate || null,
        location: locationFormatted,
      };

      const res = await authFetch(`/api/projects/${projectId}`, {
        method: "PATCH",
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
      setError(err?.message || "The project could not be updated. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      return;
    }
    setDeleting(true);
    setError("");
    try {
      const res = await authFetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${res.status}`);
      }
      router.push("/supervisor/projects");
    } catch (err: any) {
      setError(err?.message || "Could not delete project.");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center p-6">
        <p className="text-sm font-medium text-slate-500">Loading project details…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 sm:p-6 lg:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
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
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Edit Project: {name}</h1>
              <p className="mt-1 text-sm text-slate-500">
                Update site location, client details, timeline schedule, and project status.
              </p>
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={deleting}
          onClick={handleDelete}
          className="border-rose-200 text-rose-600 hover:bg-rose-50 gap-2"
        >
          <Trash2 className="size-4" /> {deleting ? "Deleting…" : "Delete Project"}
        </Button>
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
                    list="client-suggestions-edit"
                    required
                    maxLength={150}
                    value={clientTitle}
                    onChange={(e) => setClientTitle(e.target.value)}
                    placeholder="e.g. Saudi Aramco"
                    className="h-10"
                  />
                  <datalist id="client-suggestions-edit">
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

          <Section title="Allocation Overview">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-100">
                <p className="text-xs text-slate-500 font-medium">Equipment Allocated</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-slate-800">{equipmentCount}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-100">
                <p className="text-xs text-slate-500 font-medium">Technicians Assigned</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {technicians.length > 0 ? technicians.join(", ") : "None assigned"}
                </p>
              </div>
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
              <Save className="size-4" /> {saving ? "Saving Changes…" : "Update Project"}
            </Button>
          </div>
        </div>

        <div className="space-y-5 xl:sticky xl:top-20">
          <Section title="Location Preview">
            <ProjectMap latitude={location?.latitude} longitude={location?.longitude} name={name || "Site Location"} />
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
