"use client";

import { useSyncExternalStore } from "react";

export function usePageOrigin() {
  return useSyncExternalStore(() => () => {}, () => window.location.origin, () => "");
}
