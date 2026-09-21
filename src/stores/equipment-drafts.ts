"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { EquipmentRecord } from "@/features/equipment/data/sample-equipment";

export type EquipmentDraft = EquipmentRecord & { image?: string; notes?: string };
const STORAGE_KEY = "ftims-equipment-drafts-v1";
const CHANGE_EVENT = "ftims-equipment-drafts-change";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}
function snapshot() { return window.localStorage.getItem(STORAGE_KEY) ?? "[]"; }

export function useEquipmentDrafts() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "[]");
  return useMemo(() => {
    try { return JSON.parse(raw) as EquipmentDraft[]; }
    catch { return []; }
  }, [raw]);
}
