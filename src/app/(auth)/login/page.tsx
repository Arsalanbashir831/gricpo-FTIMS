"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, LockKeyhole, UserRound } from "lucide-react";

import { AuthField } from "@/components/forms/auth-field";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { storeTokens } from "@/features/auth/client/token-storage";
import type { ClientSession } from "@/features/auth/types";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.get("username"), password: form.get("password") }),
      });
      const result = await response.json() as ClientSession & { detail?: string };
      if (!response.ok) {
        setError(result.detail ?? "Sign in failed. Check your credentials.");
        return;
      }
      storeTokens(result);
      if (result.user.role === "technician") {
        if (result.user.approval_status !== "approved") {
          setNotice(result.user.approval_status === "rejected"
            ? "Your account request was rejected. Contact your supervisor for details."
            : result.user.approval_status === "suspended"
              ? "Your technician access is suspended. Contact your supervisor."
              : "Your account request is still waiting for supervisor approval.");
          return;
        }
        router.push("/technician/profile");
        router.refresh();
        return;
      }
      // role === "supervisor"
      router.push("/supervisor");
      router.refresh();
    } catch {
      setError("The service is unavailable. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell
      eyebrow="WELCOME BACK"
      title="Sign in to your workspace"
      description="Use your approved work account to continue to the field operations system."
    >
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <AuthField
          id="username"
          name="username"
          label="Username"
          type="text"
          autoComplete="username"
          placeholder="Enter your username"
          icon={<UserRound aria-hidden="true" className="size-4" />}
          required
        />
        <AuthField
          id="password"
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          icon={<LockKeyhole aria-hidden="true" className="size-4" />}
          required
        />

        {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
        {notice ? <p role="status" className="text-sm text-foreground">{notice}</p> : null}

        <Button className="mt-1 w-full" type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
          <ArrowRight aria-hidden="true" data-icon="inline-end" />
        </Button>
      </form>

      <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
        Need access?{" "}
        <Link
          className="font-semibold text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary"
          href="/register"
        >
          Request an account
        </Link>
      </div>
    </AuthShell>
  );
}
