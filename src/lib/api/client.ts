import type { TokenPair } from "@/features/auth/types";
import {
  clearStoredTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  storeTokens,
} from "@/features/auth/client/token-storage";

let refreshRequest: Promise<TokenPair> | null = null;

async function refreshTokens() {
  const refresh = getStoredRefreshToken();
  if (!refresh) throw new Error("Authentication required.");

  if (!refreshRequest) {
    refreshRequest = fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    }).then(async (response) => {
      if (!response.ok) throw new Error("Your session has expired.");
      const tokens = await response.json() as TokenPair;
      storeTokens(tokens);
      return tokens;
    }).finally(() => {
      refreshRequest = null;
    });
  }

  return refreshRequest;
}

function withAccessToken(init: RequestInit, access: string) {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${access}`);
  return { ...init, headers };
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  let access = getStoredAccessToken();
  if (!access) {
    try {
      access = (await refreshTokens()).access;
    } catch {
      clearStoredTokens();
      return new Response(JSON.stringify({ detail: "Authentication required." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  let response = await fetch(input, withAccessToken(init, access));
  if (response.status !== 401) return response;

  try {
    access = (await refreshTokens()).access;
  } catch {
    clearStoredTokens();
    return response;
  }

  response = await fetch(input, withAccessToken(init, access));
  return response;
}

export async function downloadAuthenticatedFile(url: string, filename: string) {
  const response = await authFetch(url);
  if (!response.ok) throw new Error("The file could not be downloaded.");

  const objectUrl = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(objectUrl);
}
