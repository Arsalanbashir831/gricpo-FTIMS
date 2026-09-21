"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { clearStoredTokens } from "@/features/auth/client/token-storage";
import type { CurrentAccount } from "@/features/auth/types";
import { authFetch } from "@/lib/api/client";

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [account, setAccount] = useState<CurrentAccount | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function authorize() {
      const response = await authFetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok) {
        clearStoredTokens();
        router.replace("/login");
        return;
      }
      const current = await response.json() as CurrentAccount;
      if (current.role === "technician" && current.approval_status !== "approved") {
        clearStoredTokens();
        router.replace("/login?status=approval-required");
        return;
      }
      const wrongArea = (current.role === "supervisor" && pathname.startsWith("/technician")) ||
        (current.role === "technician" && pathname.startsWith("/supervisor"));
      if (wrongArea) {
        router.replace(current.role === "supervisor" ? "/supervisor" : "/technician/dashboard");
        return;
      }
      if (active) setAccount(current);
    }
    authorize().catch(() => { if (active) setError("Your session could not be verified."); });
    return () => { active = false; };
  }, [pathname, router]);

  if (error) return <p role="alert" className="p-6 text-sm text-rose-700">{error}</p>;
  if (!account) return <div className="grid min-h-screen place-items-center text-sm text-slate-500">Checking your access…</div>;

  return <div className="flex min-h-screen bg-background"><DashboardSidebar role={account.role} /><div className="flex min-w-0 flex-1 flex-col"><DashboardHeader user={{ name: account.username, role: account.role, email: account.email }} /><main className="flex-1 overflow-y-auto">{children}</main></div></div>;
}
