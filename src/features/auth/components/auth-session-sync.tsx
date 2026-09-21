"use client";

import { useEffect } from "react";

import {
  clearStoredTokens,
  getStoredAccessToken,
  getTokenExpiration,
} from "@/features/auth/client/token-storage";
import { authFetch } from "@/lib/api/client";

const retryDelayMs = 30_000;

export function AuthSessionSync() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    const schedule = (access: string) => {
      const expiresAt = getTokenExpiration(access);
      const delay = expiresAt ? Math.max(expiresAt - Date.now() + 250, 0) : 0;
      timer = setTimeout(syncSession, delay);
    };

    const syncSession = async () => {
      try {
        const response = await authFetch("/api/auth/me", { cache: "no-store" });
        if (response.status === 401) {
          clearStoredTokens();
          window.location.replace("/login");
          return;
        }
        if (!response.ok) throw new Error("Session synchronization failed.");

        const access = getStoredAccessToken();
        if (access && !stopped) schedule(access);
      } catch {
        if (!stopped) timer = setTimeout(syncSession, retryDelayMs);
      }
    };

    const access = getStoredAccessToken();
    if (access) schedule(access);
    else void syncSession();

    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  return null;
}
