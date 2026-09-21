"use client";

import { useMemo, useSyncExternalStore } from "react";
import { seedCatalog, type ReferenceCatalog, type ReferenceGroupId, type ReferenceItem } from "@/features/settings/data/reference-data";

const key = "ftims-reference-data-v1";
const eventName = "ftims-reference-data-change";
function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(eventName, onChange);
  return () => { window.removeEventListener("storage", onChange); window.removeEventListener(eventName, onChange); };
}
function snapshot() { return window.localStorage.getItem(key) ?? "{}"; }
function parse(raw: string): ReferenceCatalog {
  try {
    const overrides = JSON.parse(raw) as Partial<ReferenceCatalog>;
    return Object.fromEntries(Object.entries(seedCatalog).map(([group, defaults]) => [group, Array.isArray(overrides[group as ReferenceGroupId]) ? overrides[group as ReferenceGroupId] : defaults])) as ReferenceCatalog;
  } catch { return seedCatalog; }
}
export function useReferenceCatalog() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "{}");
  return useMemo(() => parse(raw), [raw]);
}
export function saveReferenceGroup(group: ReferenceGroupId, items: ReferenceItem[]) {
  const current = parse(snapshot());
  window.localStorage.setItem(key, JSON.stringify({ ...current, [group]: items }));
  window.dispatchEvent(new Event(eventName));
}
