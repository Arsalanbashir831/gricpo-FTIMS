"use client";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Database, Pencil, Plus, Search, Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { authFetch } from "@/lib/api/client";

type Group = "categories" | "statuses";
type Item = { id?: number; code?: string; name: string; description?: string; is_active?: boolean; is_system?: boolean };

const groups: Array<{ id: Group; title: string; description: string }> = [
  { id: "categories", title: "Equipment Categories", description: "Categories used to classify equipment." },
  { id: "statuses", title: "Status Codes", description: "Workflow status codes used across the application." },
];

const statusKinds = [
  "equipment-statuses",
  "project-statuses",
  "technician-statuses",
  "report-statuses",
  "allocation-statuses",
  "transfer-statuses",
  "calibration-statuses",
  "fault-statuses",
  "maintenance-statuses",
];

const titleCase = (value: string) => value.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
const slug = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

export function SupervisorSettings() {
  const [group, setGroup] = useState<Group>("categories");
  const [statusKind, setStatusKind] = useState("equipment-statuses");
  const [items, setItems] = useState<Item[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Item | "new" | null>(null);
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const kind = group === "categories" ? "equipment-categories" : statusKind;
  const showsCode = group === "statuses";

  const load = useCallback(async () => {
    setError("");
    try {
      const response = await authFetch(`/api/master-data/${kind}?include_inactive=true`);
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const msg = (payload && typeof payload === "object" ? payload.detail || payload.error || Object.values(payload)[0] : null) ?? "Settings could not be loaded.";
        throw new Error(String(msg));
      }
      setItems(payload?.results ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Settings could not be loaded.");
    }
  }, [kind]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const filtered = useMemo(
    () => items.filter((item) => `${item.name} ${item.code ?? ""}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  );

  function open(item: Item | "new") {
    setEditing(item);
    setName(item === "new" ? "" : item.name);
    setActive(item === "new" ? true : item.is_active ?? true);
    setError("");
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || editing === null) return;
    try {
      const identifier = editing === "new" ? null : String(editing.id ?? editing.code);
      const url = identifier
        ? `/api/master-data/${kind}/${encodeURIComponent(identifier)}`
        : `/api/master-data/${kind}`;
      const body = group === "categories"
        ? { name: trimmed, is_active: active }
        : { ...(editing === "new" ? { code: slug(trimmed) } : {}), name: trimmed, is_active: active };
      const response = await authFetch(url, {
        method: editing === "new" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const msg = (payload && typeof payload === "object" ? payload.detail || payload.error || Object.values(payload)[0] : null) ?? "Value could not be saved.";
        throw new Error(String(msg));
      }
      setEditing(null);
      setNotice(`${trimmed} saved.`);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Value could not be saved.");
    }
  }

  async function remove(item: Item) {
    if (item.is_system || !window.confirm(`Delete ${item.name}?`)) return;
    const identifier = String(item.id ?? item.code);
    const response = await authFetch(`/api/master-data/${kind}/${encodeURIComponent(identifier)}`, { method: "DELETE" });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      const msg = (payload && typeof payload === "object" ? payload.detail || payload.error : null) ?? "This value is in use and cannot be deleted.";
      setError(String(msg));
      return;
    }
    setNotice(`${item.name} deleted.`);
    await load();
  }

  return (
    <div className="space-y-5 p-4 sm:p-6 lg:p-7">
      <header>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-sky-700">
          <Settings2 className="size-4" />Administration
        </div>
        <h1 className="mt-2 text-3xl font-semibold">Master settings</h1>
        <p className="text-sm text-slate-500">Manage only the reference data used by equipment and reporting workflows.</p>
      </header>

      {error ? <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      {notice ? <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p> : null}

      <Card className="border-0 ring-1 ring-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="size-5 text-sky-700" />Master data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex overflow-x-auto border-b">
            {groups.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setGroup(item.id);
                  setQuery("");
                  setNotice("");
                }}
                className={`min-w-max border-b-2 px-4 py-3 text-sm font-medium ${
                  group === item.id ? "border-sky-600 text-sky-700" : "border-transparent text-slate-500"
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>

          <div>
            <h2 className="font-semibold">{groups.find((item) => item.id === group)?.title}</h2>
            <p className="text-sm text-slate-500">{groups.find((item) => item.id === group)?.description}</p>
          </div>

          {group === "statuses" ? (
            <label className="grid max-w-sm gap-1 text-sm font-medium">
              Status family
              <select
                value={statusKind}
                onChange={(event) => setStatusKind(event.target.value)}
                className="h-10 rounded-lg border bg-white px-3"
              >
                {statusKinds.map((value) => (
                  <option key={value} value={value}>
                    {titleCase(value)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <label className="relative min-w-64 flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search values…"
                className="pl-9"
              />
            </label>
            <Button onClick={() => open("new")}>
              <Plus className="size-4" />Add value
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-sky-50">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  {showsCode ? <th className="px-4 py-3">Code</th> : null}
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id ?? item.code} className="border-t">
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    {showsCode ? <td className="px-4 py-3 font-mono text-xs">{item.code}</td> : null}
                    <td className="px-4 py-3">{item.is_active !== false ? "Active" : "Inactive"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button size="icon-sm" variant="ghost" disabled={item.is_system} onClick={() => open(item)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          disabled={item.is_system}
                          onClick={() => void remove(item)}
                          className="text-rose-700"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filtered.length ? <p className="p-8 text-center text-sm text-slate-500">No values found.</p> : null}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={editing !== null}
        onOpenChange={(value) => {
          if (!value) setEditing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing === "new" ? "Add" : "Edit"} value</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <label className="grid gap-1 text-sm font-medium">
              Name
              <Input required value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
              Active
            </label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
