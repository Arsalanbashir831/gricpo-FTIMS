"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";

import { AuthField } from "@/components/forms/auth-field";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      username: form.get("username"),
      password: form.get("password"),
      technician_number: form.get("technician_number"),
      name: form.get("name"),
      contact: form.get("contact"),
      discipline: form.get("discipline"),
      qualification: form.get("qualification"),
      email: form.get("email"),
    };
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        const first = Object.entries(result).find(([, value]) => Array.isArray(value));
        setError(first ? `${first[0]}: ${(first[1] as string[]).join(" ")}` : result.detail ?? "Account request failed.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("The service is unavailable. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell eyebrow="ACCOUNT REQUEST" title="Join your field team" description="Send your details for approval. An administrator will review your request.">
      {success ? (
        <div role="status" className="rounded-lg border border-border p-5 text-sm">
          Your account request was received. You can sign in after an administrator approves it.
          <Link className="mt-4 block font-semibold underline underline-offset-4" href="/login">Go to sign in</Link>
        </div>
      ) : (
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <AuthField id="name" name="name" label="Full name" type="text" autoComplete="name" placeholder="Your full name" icon={<UserRound aria-hidden="true" className="size-4" />} required />
          <div className="grid gap-5 sm:grid-cols-2">
            <AuthField id="username" name="username" label="Username" type="text" autoComplete="username" placeholder="Choose a username" required />
            <AuthField id="technician-number" name="technician_number" label="Technician number" type="text" placeholder="Your technician number" required />
          </div>
          <AuthField id="password" name="password" label="Password" type="password" autoComplete="new-password" placeholder="Choose a password" icon={<LockKeyhole aria-hidden="true" className="size-4" />} required />
          <div className="grid gap-5 sm:grid-cols-2">
            <AuthField id="contact" name="contact" label="Contact number" type="tel" autoComplete="tel" placeholder="Your phone number" required />
            <AuthField id="discipline" name="discipline" label="Discipline" type="text" placeholder="Your specialty" required />
          </div>
          <AuthField id="qualification" name="qualification" label="Qualification (optional)" type="text" placeholder="Your qualification" />
          <AuthField id="email" name="email" label="Work email (optional)" type="email" autoComplete="email" placeholder="name@company.com" icon={<Mail aria-hidden="true" className="size-4" />} />
          {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
          <Button className="mt-1 w-full" type="submit" disabled={pending}>
            {pending ? "Sending request…" : "Request account"}
            <ArrowRight aria-hidden="true" data-icon="inline-end" />
          </Button>
        </form>
      )}
      <div className="mt-7 border-t pt-6 text-center text-sm text-muted-foreground">
        Already approved?{" "}
        <Link className="font-semibold text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary" href="/login">Sign in</Link>
      </div>
    </AuthShell>
  );
}
