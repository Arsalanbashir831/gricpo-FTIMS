import type { TokenPair } from "@/features/auth/types";

export const accessTokenKey = "accessToken";
export const refreshTokenKey = "refreshToken";

export function storeTokens(tokens: TokenPair) {
  localStorage.setItem(accessTokenKey, tokens.access);
  localStorage.setItem(refreshTokenKey, tokens.refresh);
}

export function clearStoredTokens() {
  localStorage.removeItem(accessTokenKey);
  localStorage.removeItem(refreshTokenKey);
}

export function getStoredAccessToken() {
  return localStorage.getItem(accessTokenKey);
}

export function getStoredRefreshToken() {
  return localStorage.getItem(refreshTokenKey);
}

export function getTokenExpiration(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))) as { exp?: unknown };
    return typeof payload.exp === "number" ? payload.exp * 1_000 : null;
  } catch {
    return null;
  }
}
