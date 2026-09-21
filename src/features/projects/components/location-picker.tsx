"use client";

import { useState } from "react";
import { Check, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LocationSearchResult } from "@/features/projects/types";

export function LocationPicker({ value, onChange }: {
  value: LocationSearchResult | null;
  onChange: (location: LocationSearchResult | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [candidate, setCandidate] = useState<LocationSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function search() {
    const term = query.trim();
    if (term.length < 3) { setError("Enter at least 3 characters to search."); return; }
    setLoading(true);
    setError("");
    setSearched(false);
    setCandidate(null);
    try {
      const response = await fetch(`/api/locations/search?q=${encodeURIComponent(term)}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Location search failed.");
      setResults(payload.results as LocationSearchResult[]);
      setSearched(true);
    } catch (cause) {
      setResults([]);
      setError(cause instanceof Error ? cause.message : "Location search failed.");
    } finally {
      setLoading(false);
    }
  }

  return <div className="space-y-3">
    <div className="flex flex-wrap gap-2">
      <label htmlFor="location-search" className="sr-only">Search project location</label>
      <Input id="location-search" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void search(); } }} placeholder="Search city, site, or address" className="h-10 min-w-52 flex-1" />
      <Button type="button" onClick={() => void search()} disabled={loading}><Search className="size-4" /> {loading ? "Searching…" : "Search map"}</Button>
    </div>
    {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
    {searched && results.length === 0 && <p className="text-sm text-muted-foreground">No places found. Try a nearby city or a broader search.</p>}
    {results.length > 0 && <fieldset className="overflow-hidden rounded-lg border border-slate-200">
      <legend className="px-1 text-sm font-medium text-slate-700">Search results</legend>
      <div className="max-h-56 overflow-y-auto">{results.map((result) => <label key={result.id} className="flex cursor-pointer items-start gap-3 border-b border-slate-100 px-3 py-2.5 text-sm last:border-0 hover:bg-sky-50">
        <input type="radio" name="location-result" checked={candidate?.id === result.id} onChange={() => setCandidate(result)} className="mt-1 size-4 accent-sky-600" />
        <span className="min-w-0">{result.label}</span>
      </label>)}</div>
    </fieldset>}
    {candidate && <Button type="button" onClick={() => { onChange(candidate); setResults([]); setCandidate(null); setSearched(false); }}><Check className="size-4" /> Confirm this location</Button>}
    {value && <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900"><MapPin className="mt-0.5 size-4 shrink-0" /><div className="min-w-0 flex-1"><p className="font-medium">Confirmed location</p><p>{value.label}</p></div><button type="button" onClick={() => onChange(null)} className="shrink-0 font-medium underline">Change</button></div>}
    <p className="text-xs text-muted-foreground">Place search by OpenStreetMap contributors. Search is sent only when you press Search map.</p>
  </div>;
}
