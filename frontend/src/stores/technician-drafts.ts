"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { TechnicianRecord } from "@/features/technicians/data/sample-technicians";

const KEY = "ftims-technician-drafts-v1";
const EVENT = "ftims-technician-drafts-change";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

function snapshot() { return window.localStorage.getItem(KEY) ?? "[]"; }

export function useTechnicianDrafts() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "[]");
  return useMemo(() => {
    try { return JSON.parse(raw) as TechnicianRecord[]; }
    catch { return []; }
  }, [raw]);
}

export function saveTechnicianDraft(record: TechnicianRecord) {
  const current = JSON.parse(snapshot()) as TechnicianRecord[];
  window.localStorage.setItem(KEY, JSON.stringify([record, ...current.filter((item) => item.id !== record.id)]));
  window.dispatchEvent(new Event(EVENT));
}
