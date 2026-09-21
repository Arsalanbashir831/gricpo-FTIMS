"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { ReportStatus } from "@/features/reports/data/sample-reports";

export type ReportReview = { status: ReportStatus; reviewedAt: string; reviewer: string; reason: string };
const KEY = "ftims-report-reviews-v1";
const EVENT = "ftims-report-reviews-change";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

function snapshot() { return window.localStorage.getItem(KEY) ?? "{}"; }

export function useReportReviews() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "{}");
  return useMemo(() => {
    try { return JSON.parse(raw) as Record<string, ReportReview>; }
    catch { return {}; }
  }, [raw]);
}

export function saveReportReview(id: string, review: ReportReview) {
  const current = JSON.parse(snapshot()) as Record<string, ReportReview>;
  window.localStorage.setItem(KEY, JSON.stringify({ ...current, [id]: review }));
  window.dispatchEvent(new Event(EVENT));
}
