"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  User,
  Mail,
  KeyRound,
  LogOut,
  CalendarCheck,
  Package,
  Users,
  Settings2,
  BadgeAlert,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { clearStoredTokens, getStoredRefreshToken } from "@/features/auth/client/token-storage";
import type { CurrentAccount } from "@/features/auth/types";
import { authFetch } from "@/lib/api/client";

export function SupervisorProfileScreen() {
  const router = useRouter();
  const [account, setAccount] = useState<CurrentAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadAccount() {
      try {
        const response = await authFetch("/api/auth/me", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Unable to retrieve account details.");
        }
        const data = (await response.json()) as CurrentAccount;
        if (active) {
          setAccount(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load profile.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAccount();
    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const refresh = getStoredRefreshToken();
      if (refresh) {
        await authFetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh }),
        }).catch(() => {
          // Continue local cleanup even if network request fails
        });
      }
    } finally {
      clearStoredTokens();
      router.replace("/login");
      router.refresh();
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm">Loading your profile…</p>
      </div>
    );
  }

  const initials = (account?.username || "Supervisor")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Supervisor Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Account identity, operational roles, and security controls for GRIPCO FTIMS.
          </p>
        </div>

        <Button
          variant="destructive"
          onClick={() => void handleLogout()}
          disabled={loggingOut}
          className="gap-2 self-start sm:self-auto"
        >
          {loggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          {loggingOut ? "Signing out…" : "Log Out"}
        </Button>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          <BadgeAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {/* Hero Overview Card */}
      <Card className="overflow-hidden border border-border/80 shadow-xs">
        <div className="h-28 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 sm:h-32" />
        <CardContent className="relative px-6 pb-6 pt-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="-mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-end">
              <Avatar className="h-24 w-24 border-4 border-background bg-muted text-2xl font-bold shadow-md">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    {account?.username}
                  </h2>
                  <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Administrator
                  </Badge>
                  {account?.is_superuser ? (
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle2 className="h-3 w-3 text-sky-600" />
                      Superuser
                    </Badge>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  {account?.email || "No email registered"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Active Supervisor Session
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Details */}
        <Card className="border border-border/80">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Account Information
            </CardTitle>
            <CardDescription>
              Basic identity credentials and system attributes.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border/60 text-sm">
            <div className="flex justify-between py-2.5">
              <span className="text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" /> Username
              </span>
              <span className="font-medium">{account?.username}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email Address
              </span>
              <span className="font-medium text-foreground">
                {account?.email || "Not specified"}
              </span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-muted-foreground flex items-center gap-2">
                <KeyRound className="h-4 w-4" /> Account Role
              </span>
              <span className="font-medium capitalize">{account?.role}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Staff Privileges
              </span>
              <span className="font-medium">
                {account?.is_staff || account?.is_superuser ? "Enabled (Staff User)" : "Standard"}
              </span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Superadmin Access
              </span>
              <span className="font-medium">
                {account?.is_superuser ? "Full Superuser" : "Operational Admin"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Operational Modules & Capabilities */}
        <Card className="border border-border/80">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Administrative Capabilities
            </CardTitle>
            <CardDescription>
              Modules you have authorization to monitor and manage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/40 p-2.5">
              <Package className="h-4 w-4 mt-0.5 text-primary" />
              <div>
                <p className="font-medium">Equipment & Allocations</p>
                <p className="text-xs text-muted-foreground">
                  Create, update, allocate, and return equipment across project sites.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/40 p-2.5">
              <CalendarCheck className="h-4 w-4 mt-0.5 text-primary" />
              <div>
                <p className="font-medium">Calibration & Compliance</p>
                <p className="text-xs text-muted-foreground">
                  Register certificates, track validity dates, and review calibration alerts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/40 p-2.5">
              <Users className="h-4 w-4 mt-0.5 text-primary" />
              <div>
                <p className="font-medium">Technicians & Reports</p>
                <p className="text-xs text-muted-foreground">
                  Approve new technician accounts, assign equipment, and verify inspection reports.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/40 p-2.5">
              <Settings2 className="h-4 w-4 mt-0.5 text-primary" />
              <div>
                <p className="font-medium">Master Data Management</p>
                <p className="text-xs text-muted-foreground">
                  Configure equipment categories and system status codes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Management & Logout Card */}
      <Card className="border border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-destructive flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Active Session & Sign Out
          </CardTitle>
          <CardDescription>
            Terminate your session securely on this workstation.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground max-w-xl">
            Signing out will invalidate your JWT refresh token in the backend and wipe your local
            authentication tokens. You will be redirected to the login screen.
          </p>
          <Button
            variant="destructive"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className="gap-2 shrink-0"
          >
            {loggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            {loggingOut ? "Signing out…" : "Log Out of GRIPCO"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
