"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  ExternalLink,
  MapPin,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Users,
  Wrench,
  X,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProjectMap, projectMapLink } from "@/features/projects/components/project-map";
import type {
  ClientReference,
  ProjectReferences,
  ProjectSite,
  ProjectSitePage,
  ProjectStatus,
  ProjectStatusReference,
} from "@/features/projects/types";
import { authFetch } from "@/lib/api/client";

const statusStyles: Record<string, { label: string; tone: string }> = {
  planned: { label: "Planned", tone: "bg-amber-50 text-amber-800 border-amber-200" },
  active: { label: "Active", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  on_hold: { label: "On Hold", tone: "bg-rose-50 text-rose-700 border-rose-200" },
  completed: { label: "Completed", tone: "bg-slate-100 text-slate-700 border-slate-200" },
  cancelled: { label: "Cancelled", tone: "bg-red-100 text-red-800 border-red-200" },
};

function formatProjectDate(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function extractCoordinates(location: string): { latitude?: number; longitude?: number; label: string } {
  // Check if location contains "lat:24.123, lng:45.123" or similar format
  const match = location.match(/lat:\s*(-?\d+(\.\d+)?)\s*,\s*lng:\s*(-?\d+(\.\d+)?)/i);
  if (match) {
    const label = location.replace(/lat:\s*-?\d+(\.\d+)?\s*,\s*lng:\s*-?\d+(\.\d+)?/i, "").trim().replace(/^[,;\s]+|[,;\s]+$/g, "");
    return { latitude: parseFloat(match[1]), longitude: parseFloat(match[3]), label: label || location };
  }
  return { label: location };
}

export function SupervisorProjects() {
  const [data, setData] = useState<ProjectSitePage>({ count: 0, next: null, previous: null, results: [] });
  const [references, setReferences] = useState<ProjectReferences>({ clients: [], statuses: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [client, setClient] = useState("");
  const [status, setStatus] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"All" | "active" | "completed">("All");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [ordering, setOrdering] = useState("-pk");
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
      ordering,
    });
    if (search) params.set("search", search);
    if (client) params.set("client", client);
    if (status) params.set("status", status);
    else if (view === "active") params.set("status", "active");
    else if (view === "completed") params.set("status", "completed");

    try {
      setLoading(true);
      const res = await authFetch(`/api/projects?${params}`);
      if (!res.ok) throw new Error();
      const result: ProjectSitePage = await res.json();
      setData(result);
      setError("");
    } catch {
      setError("Project sites could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, ordering, search, client, status, view]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    authFetch("/api/projects/references")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((res: ProjectReferences) => setReferences(res))
      .catch(() => {});
  }, []);

  const selected = useMemo(() => {
    return data.results.find((item) => item.id === selectedId) ?? null;
  }, [data.results, selectedId]);

  const selectedCoords = useMemo<ReturnType<typeof extractCoordinates>>(() => {
    if (!selected) return { label: "" };
    return extractCoordinates(selected.location);
  }, [selected]);

  // Overall metric counts
  const summaryMetrics = useMemo(() => {
    const total = data.count;
    const active = data.results.filter((i) => i.status === "active").length;
    const equipmentTotal = data.results.reduce((acc, curr) => acc + (curr.equipment_count || 0), 0);
    const techSet = new Set(data.results.flatMap((i) => i.technician_names || []));

    return [
      { label: "Total Projects", value: total, icon: BriefcaseBusiness, color: "bg-sky-500" },
      { label: "Active Sites", value: active, icon: MapPin, color: "bg-emerald-500" },
      { label: "Equipment Allocated", value: equipmentTotal, icon: Wrench, color: "bg-amber-500" },
      { label: "Technicians Assigned", value: techSet.size, icon: Users, color: "bg-violet-500" },
    ];
  }, [data]);

  const pageCount = Math.max(1, Math.ceil(data.count / pageSize));

  const handleReset = () => {
    setClient("");
    setStatus("");
    setSearchDraft("");
    setSearch("");
    setView("All");
    setSelectedId(null);
    setPage(1);
    setOrdering("-pk");
  };

  const handleQuickStatusChange = async (projectId: number, newStatus: ProjectStatus) => {
    try {
      setUpdatingStatusId(projectId);
      const res = await authFetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.detail || "Status could not be updated.");
      }
      await load();
    } catch (e: any) {
      alert(e.message || "Failed to update project status.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDeleteProject = async (project: ProjectSite) => {
    if (!window.confirm(`Are you sure you want to delete project site "${project.name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      setDeletingId(project.id);
      const res = await authFetch(`/api/projects/${project.id}`, { method: "DELETE" });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.detail || "Project could not be deleted.");
      }
      if (selectedId === project.id) setSelectedId(null);
      await load();
    } catch (e: any) {
      alert(e.message || "Failed to delete project.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-slate-50/60 min-h-screen">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Projects &amp; Sites
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage project sites, location mapping, live equipment allocations, and technician field teams.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/supervisor/projects/new" />}
        >
          <Plus className="size-4" />
          <span>Add New Project</span>
        </Button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryMetrics.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-0 bg-white shadow-xs ring-1 ring-slate-200/80">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex size-13 shrink-0 items-center justify-center rounded-xl text-white ${color} shadow-xs`}>
                <Icon className="size-6" />
              </div>
              <div>
                <strong className="block text-2xl font-bold tabular-nums text-slate-900">{value}</strong>
                <span className="text-xs font-medium text-slate-500">{label}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Toolbar */}
      <Card className="border-0 bg-white shadow-xs ring-1 ring-slate-200/80">
        <CardContent className="p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(searchDraft.trim());
              setPage(1);
            }}
            className="flex flex-wrap items-center gap-3"
          >
            {/* Search Input */}
            <div className="relative flex-1 min-w-[260px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder="Search project name, client, location…"
                className="pl-9 h-10 rounded-lg border-slate-200 bg-white text-sm"
              />
            </div>

            {/* Client Filter */}
            <select
              value={client}
              onChange={(e) => {
                setClient(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
            >
              <option value="">All Clients</option>
              {references.clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="planned">Planned</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <Button type="button" variant="outline" onClick={handleReset} className="h-10 border-slate-200 text-slate-600">
              <RotateCcw className="size-4 mr-1.5" />
              Reset
            </Button>

            <Button type="submit">
              Apply Filters
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Main Content Area: Table + Side Details Panel */}
      <div className={`grid items-start gap-5 ${selected ? "xl:grid-cols-[minmax(0,1fr)_390px]" : ""}`}>
        {/* Project Sites Data Table Card */}
        <Card className="min-w-0 border-0 bg-white shadow-xs ring-1 ring-slate-200/80">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Projects / Sites List</CardTitle>
              <p className="mt-1 text-xs text-slate-500">
                {data.count} {data.count === 1 ? "project site" : "project sites"} registered
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="mr-1 text-slate-400 font-medium">View:</span>
              {(["All", "active", "completed"] as const).map((opt) => (
                <Button
                  key={opt}
                  type="button"
                  size="sm"
                  variant={view === opt ? "default" : "outline"}
                  onClick={() => {
                    setView(opt);
                    setStatus("");
                    setPage(1);
                  }}
                  className={`h-8 text-xs capitalize ${view === opt ? "bg-sky-600 text-white" : "border-slate-200"}`}
                >
                  {opt}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-sky-50/70 border-b border-sky-100 text-xs font-semibold text-slate-700">
                    <th className="px-4 py-3.5">#</th>
                    <th className="px-4 py-3.5">Project / Site Name</th>
                    <th className="px-4 py-3.5">Client</th>
                    <th className="px-4 py-3.5">Location</th>
                    <th className="px-4 py-3.5 text-center">Allocated Equipment</th>
                    <th className="px-4 py-3.5">Technicians</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Dates</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.results.map((item, index) => {
                    const statusMeta = statusStyles[item.status] || {
                      label: item.status_name || item.status,
                      tone: "bg-slate-100 text-slate-700 border-slate-200",
                    };
                    const isSelected = selectedId === item.id;
                    const coords = extractCoordinates(item.location);

                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedId(item.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-sky-50/80 font-medium" : "hover:bg-slate-50/70"
                        }`}
                      >
                        <td className="px-4 py-3.5 tabular-nums text-slate-400">
                          {(page - 1) * pageSize + index + 1}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedId(item.id);
                            }}
                            className="font-semibold text-sky-700 hover:underline hover:text-sky-900"
                          >
                            {item.name}
                          </button>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-slate-700 font-medium">
                          {item.client_name || "—"}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 text-xs">
                          <span className="inline-flex items-center gap-1.5 max-w-[200px] truncate" title={item.location}>
                            <MapPin className="size-3.5 text-sky-600 shrink-0" />
                            {coords.label || item.location}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center tabular-nums font-semibold text-slate-800">
                          <span className="inline-flex items-center justify-center min-w-7 px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs">
                            {item.equipment_count || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {item.technician_names && item.technician_names.length > 0 ? (
                            <div className="flex items-center -space-x-1">
                              {item.technician_names.slice(0, 3).map((techName) => (
                                <span
                                  key={techName}
                                  title={techName}
                                  className="flex size-7 items-center justify-center rounded-full border-2 border-white bg-sky-100 text-[10px] font-bold text-sky-800"
                                >
                                  {initials(techName)}
                                </span>
                              ))}
                              {item.technician_names.length > 3 && (
                                <span className="pl-1.5 text-xs text-slate-500 font-medium">
                                  +{item.technician_names.length - 3}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={item.status}
                            disabled={updatingStatusId === item.id}
                            onChange={(e) => handleQuickStatusChange(item.id, e.target.value as ProjectStatus)}
                            className={`rounded-md border px-2 py-1 text-xs font-semibold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-sky-500 ${statusMeta.tone}`}
                          >
                            <option value="planned">Planned</option>
                            <option value="active">Active</option>
                            <option value="on_hold">On Hold</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500 tabular-nums">
                          <div>{formatProjectDate(item.start_date)}</div>
                          <div className="text-[11px] text-slate-400">to {formatProjectDate(item.end_date)}</div>
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              nativeButton={false}
                              variant="ghost"
                              size="icon-sm"
                              render={<Link href={`/supervisor/projects/${item.id}/edit`} />}
                              aria-label={`Edit ${item.name}`}
                              className="text-slate-600 hover:text-sky-700 hover:bg-sky-50"
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              disabled={deletingId === item.id}
                              onClick={() => handleDeleteProject(item)}
                              aria-label={`Delete ${item.name}`}
                              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {loading ? (
                <p className="py-12 text-center text-sm text-slate-500">Loading project sites…</p>
              ) : !data.results.length ? (
                <div className="py-12 text-center">
                  <p className="text-sm font-medium text-slate-600">No projects match your current filters.</p>
                  <Button variant="ghost" size="sm" onClick={handleReset} className="mt-2 text-sky-700">
                    Reset filters
                  </Button>
                </div>
              ) : null}
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-4 text-xs text-slate-600">
              <label className="flex items-center gap-2">
                Show
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs"
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                entries
              </label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((v) => Math.max(1, v - 1))}
                  className="h-8 border-slate-200 text-xs"
                >
                  Previous
                </Button>
                <span className="px-2 font-medium">
                  Page {page} of {pageCount}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pageCount || loading}
                  onClick={() => setPage((v) => Math.min(pageCount, v + 1))}
                  className="h-8 border-slate-200 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Project Details Side Panel */}
        {selected && (
          <aside className="min-w-0 xl:sticky xl:top-20" aria-label={`Details for ${selected.name}`}>
            <Card className="border-0 bg-white shadow-xs ring-1 ring-slate-200/80">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
                <CardTitle className="text-base font-semibold text-slate-900">Project Location &amp; Details</CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close project details"
                  onClick={() => setSelectedId(null)}
                >
                  <X className="size-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <ProjectMap latitude={selectedCoords.latitude} longitude={selectedCoords.longitude} name={selected.name} />

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">{selected.name}</h3>
                    <Button
                      nativeButton={false}
                      variant="outline"
                      size="sm"
                      render={<Link href={`/supervisor/projects/${selected.id}/edit`} />}
                      className="h-7 text-xs gap-1 border-slate-200"
                    >
                      <Pencil className="size-3.5" /> Edit
                    </Button>
                  </div>

                  <dl className="mt-3 space-y-2.5 text-xs">
                    <div className="grid grid-cols-[110px_1fr] gap-2 border-b border-slate-100 pb-2">
                      <dt className="text-slate-400 font-medium">Client</dt>
                      <dd className="font-semibold text-slate-800">{selected.client_name}</dd>
                    </div>
                    <div className="grid grid-cols-[110px_1fr] gap-2 border-b border-slate-100 pb-2">
                      <dt className="text-slate-400 font-medium">Location</dt>
                      <dd className="font-medium text-slate-800">{selectedCoords.label || selected.location}</dd>
                    </div>
                    <div className="grid grid-cols-[110px_1fr] gap-2 border-b border-slate-100 pb-2">
                      <dt className="text-slate-400 font-medium">Status</dt>
                      <dd className="font-semibold capitalize text-slate-800">{selected.status_name || selected.status}</dd>
                    </div>
                    <div className="grid grid-cols-[110px_1fr] gap-2 border-b border-slate-100 pb-2">
                      <dt className="text-slate-400 font-medium">Start Date</dt>
                      <dd className="font-medium text-slate-800">{formatProjectDate(selected.start_date)}</dd>
                    </div>
                    <div className="grid grid-cols-[110px_1fr] gap-2 border-b border-slate-100 pb-2">
                      <dt className="text-slate-400 font-medium">End Date</dt>
                      <dd className="font-medium text-slate-800">{formatProjectDate(selected.end_date)}</dd>
                    </div>
                    <div className="grid grid-cols-[110px_1fr] gap-2 border-b border-slate-100 pb-2">
                      <dt className="text-slate-400 font-medium">Equipment</dt>
                      <dd className="font-bold text-slate-900">{selected.equipment_count || 0} items allocated</dd>
                    </div>
                    <div className="grid grid-cols-[110px_1fr] gap-2 border-b border-slate-100 pb-2">
                      <dt className="text-slate-400 font-medium">Field Technicians</dt>
                      <dd className="font-medium text-slate-800">
                        {selected.technician_names && selected.technician_names.length > 0
                          ? selected.technician_names.join(", ")
                          : "None currently allocated"}
                      </dd>
                    </div>
                  </dl>
                </div>

                {selectedCoords.latitude !== undefined && selectedCoords.longitude !== undefined && (
                  <a
                    href={projectMapLink(selectedCoords.latitude, selectedCoords.longitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-sky-300 text-xs font-semibold text-sky-700 hover:bg-sky-50 transition-colors"
                  >
                    <ExternalLink className="size-3.5" /> View on OpenStreetMap
                  </a>
                )}
              </CardContent>
            </Card>
          </aside>
        )}
      </div>
    </div>
  );
}
