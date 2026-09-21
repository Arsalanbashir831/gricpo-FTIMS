"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Download, Eye, Plus, RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/shared/dashboard-widgets";
import type { Equipment, EquipmentPage, EquipmentReference, EquipmentSummary } from "@/features/equipment/types";
import { authFetch } from "@/lib/api/client";

interface References { categories: EquipmentReference[]; statuses: EquipmentReference[] }
const emptySummary: EquipmentSummary = { total: 0, allocated: 0, maintenance: 0, out_of_service: 0, calibration_expired: 0, calibration_due: 0, calibration_missing: 0 };

function csvCell(value: unknown) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }
function exportCsv(records: Equipment[]) {
  const fields: (keyof Equipment)[] = ["equipment_number", "description", "category_name", "brand", "model", "serial_number", "calibration_due", "status_name"];
  const rows = [["Equipment number", "Description", "Category", "Brand", "Model", "Serial number", "Calibration due", "Status"], ...records.map((record) => fields.map((field) => record[field]))];
  const url = URL.createObjectURL(new Blob([rows.map((row) => row.map(csvCell).join(",")).join("\n")], { type: "text/csv" }));
  const link = document.createElement("a"); link.href = url; link.download = "equipment.csv"; link.click(); URL.revokeObjectURL(url);
}

export function SupervisorEquipment() {
  const [data, setData] = useState<EquipmentPage>({ count: 0, next: null, previous: null, results: [] });
  const [summary, setSummary] = useState(emptySummary);
  const [references, setReferences] = useState<References>({ categories: [], statuses: [] });
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [calibration, setCalibration] = useState("");
  const [ordering, setOrdering] = useState("equipment_number");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize), ordering });
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (status) params.set("status", status);
    if (calibration) params.set("calibration", calibration);
    const summaryParams = new URLSearchParams(params); summaryParams.delete("page"); summaryParams.delete("page_size");
    try {
      const [listResponse, summaryResponse] = await Promise.all([
        authFetch(`/api/equipment?${params}`), authFetch(`/api/equipment/summary?${summaryParams}`),
      ]);
      if (!listResponse.ok || !summaryResponse.ok) throw new Error();
      setData(await listResponse.json()); setSummary(await summaryResponse.json());
    } catch { setError("Equipment records could not be loaded."); }
    finally { setLoading(false); }
  }, [page, pageSize, ordering, search, category, status, calibration]);

  // Fetching follows the selected server-side query controls.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    authFetch("/api/equipment/references").then((response) => response.ok ? response.json() : Promise.reject()).then(setReferences).catch(() => setError("Equipment filters could not be loaded."));
  }, []);

  const metrics = [
    ["Total", summary.total], ["Allocated", summary.allocated], ["Maintenance", summary.maintenance],
    ["Out of service", summary.out_of_service], ["Calibration expired", summary.calibration_expired],
    ["Calibration due", summary.calibration_due], ["No calibration", summary.calibration_missing],
  ] as const;
  const totalPages = Math.max(1, Math.ceil(data.count / pageSize));
  function clear() { setSearchDraft(""); setSearch(""); setCategory(""); setStatus(""); setCalibration(""); setOrdering("equipment_number"); setPage(1); }

  return <div className="space-y-5 p-4 sm:p-6 lg:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Equipment</h1><p className="mt-1 text-sm text-muted-foreground">Manage equipment inventory, status, calibration, and allocation.</p></div><Button nativeButton={false} render={<Link href="/supervisor/equipment/new" />}><Plus className="size-4" /> Add equipment</Button></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">{metrics.map(([label, value]) => <Card key={label} className="border-0 py-4 ring-1 ring-slate-200/80"><CardContent><strong className="block text-2xl tabular-nums">{value}</strong><span className="text-xs text-muted-foreground">{label}</span></CardContent></Card>)}</div>
    <Card className="border-0 ring-1 ring-slate-200/80"><CardHeader><CardTitle>Filters and search</CardTitle></CardHeader><CardContent className="space-y-3"><form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); setSearch(searchDraft.trim()); setPage(1); }}><Input aria-label="Search equipment" value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Search equipment number, description, serial number, brand, or model" /><Button type="submit"><Search className="size-4" /> Search</Button><Button type="button" variant="ghost" onClick={clear}><RotateCcw className="size-4" /> Clear</Button></form><div className="grid gap-3 sm:grid-cols-4">
      <select aria-label="Category" value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} className="h-10 rounded-lg border bg-white px-3 text-sm"><option value="">All categories</option>{references.categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
      <select aria-label="Status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-10 rounded-lg border bg-white px-3 text-sm"><option value="">All statuses</option>{references.statuses.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select>
      <select aria-label="Calibration" value={calibration} onChange={(event) => { setCalibration(event.target.value); setPage(1); }} className="h-10 rounded-lg border bg-white px-3 text-sm"><option value="">All calibration states</option><option value="expired">Expired</option><option value="due">Due within 30 days</option><option value="current">Current</option><option value="missing">Not recorded</option></select>
      <select aria-label="Sort equipment" value={ordering} onChange={(event) => { setOrdering(event.target.value); setPage(1); }} className="h-10 rounded-lg border bg-white px-3 text-sm"><option value="equipment_number">Equipment number</option><option value="-equipment_number">Equipment number, descending</option><option value="description">Description</option><option value="brand">Brand</option><option value="serial_number">Serial number</option></select>
    </div></CardContent></Card>
    {error ? <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
    <Card className="border-0 ring-1 ring-slate-200/80"><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Equipment list</CardTitle><p className="mt-1 text-xs text-muted-foreground">{data.count} {data.count === 1 ? "record" : "records"}</p></div><Button type="button" variant="outline" size="sm" disabled={!data.results.length} onClick={() => exportCsv(data.results)}><Download className="size-4" /> Export this page</Button></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm"><thead><tr className="bg-sky-50"><th className="px-3 py-3">Equipment</th><th className="px-3 py-3">Category</th><th className="px-3 py-3">Brand and model</th><th className="px-3 py-3">Serial number</th><th className="px-3 py-3">Calibration due</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Site and custodian</th><th className="px-3 py-3">Action</th></tr></thead><tbody>{data.results.map((record) => <tr key={record.id} className="border-b"><td className="px-3 py-3"><Link href={`/supervisor/equipment/${record.id}`} className="font-medium text-sky-700 hover:underline">{record.equipment_number}</Link><span className="block text-xs text-muted-foreground">{record.description}</span></td><td className="px-3 py-3">{record.category_name}</td><td className="px-3 py-3">{record.brand} · {record.model}</td><td className="px-3 py-3 font-mono text-xs">{record.serial_number}</td><td className="px-3 py-3">{record.calibration_due ?? "Not recorded"}</td><td className="px-3 py-3"><StatusPill tone={record.status === "active" ? "green" : record.status === "maintenance" ? "amber" : "red"}>{record.status_name}</StatusPill></td><td className="px-3 py-3">{record.current_allocation ? <>{record.current_allocation.project_site_name}<span className="block text-xs text-muted-foreground">{record.current_allocation.custodian_name}</span></> : "Store"}</td><td className="px-3 py-3"><Button nativeButton={false} size="icon-sm" variant="ghost" render={<Link href={`/supervisor/equipment/${record.id}`} />} aria-label={`View ${record.equipment_number}`}><Eye className="size-4" /></Button></td></tr>)}</tbody></table>{loading ? <p className="py-8 text-center text-sm text-muted-foreground">Loading equipment…</p> : !data.results.length ? <p className="py-8 text-center text-sm text-muted-foreground">No equipment matches these filters.</p> : null}</div><div className="mt-4 flex items-center justify-between gap-3 text-sm"><label>Show <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="rounded border px-2 py-1">{[10, 25, 50].map((size) => <option key={size}>{size}</option>)}</select> entries</label><div className="flex items-center gap-2"><Button variant="outline" size="sm" disabled={!data.previous || loading} onClick={() => setPage((value) => value - 1)}>Previous</Button><span>Page {page} of {totalPages}</span><Button variant="outline" size="sm" disabled={!data.next || loading} onClick={() => setPage((value) => value + 1)}>Next</Button></div></div></CardContent></Card>
  </div>;
}
