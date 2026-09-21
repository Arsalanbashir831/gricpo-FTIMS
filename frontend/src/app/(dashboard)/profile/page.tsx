"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/api/client";
import type { CurrentAccount } from "@/features/auth/types";

export default function ProfileRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    let active = true;
    async function determineProfile() {
      try {
        const response = await authFetch("/api/auth/me");
        if (!response.ok) {
          router.replace("/login");
          return;
        }
        const account = (await response.json()) as CurrentAccount;
        if (active) {
          router.replace(account.role === "technician" ? "/technician/profile" : "/supervisor/profile");
        }
      } catch {
        router.replace("/login");
      }
    }

    determineProfile();
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <div className="grid min-h-[50vh] place-items-center text-sm text-muted-foreground">
      Redirecting to your profile…
    </div>
  );
}
