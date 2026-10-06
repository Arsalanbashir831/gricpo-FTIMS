"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";

import { AuthField } from "@/components/forms/auth-field";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";

const fieldLabels: Record<string, string> = {
  name: "Full name", username: "Username", password: "Password",
  technician_number: "Technician number", contact: "Contact number",
  discipline: "Discipline", qualification: "Qualification",
  iqama_no: "Iqama number", email: "Work email",
};

function errorMessages(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(errorMessages);
  if (value && typeof value === "object") return Object.values(value).flatMap(errorMessages);
  return [];
}

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalErrors, setGeneralErrors] = useState<string[]>([]);
  const errorSummary = useRef<HTMLDivElement>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setGeneralErrors([]);
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
      iqama_no: form.get("iqama_no"),
      email: form.get("email"),
    };
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const fields: Record<string, string[]> = {};
        const general: string[] = [];
        if (result && typeof result === "object" && !Array.isArray(result)) {
          for (const [key, value] of Object.entries(result)) {
            const messages = errorMessages(value);
            if (key in fieldLabels && messages.length) fields[key] = messages;
            else general.push(...messages);
          }
        } else general.push(...errorMessages(result));
        setFieldErrors(fields);
        setGeneralErrors(general);
        setError(Object.keys(fields).length ? "Please review the highlighted fields." : "Your account request could not be submitted.");
        if (!Object.keys(fields).length && !general.length) setGeneralErrors(["Please try again. If the problem continues, contact your administrator."]);
        window.requestAnimationFrame(() => errorSummary.current?.focus());
        return;
      }
      setSuccess(true);
    } catch {
      setError("We couldn't connect to the service.");
      setGeneralErrors(["Please check your connection and try again. Your details have been kept in the form."]);
      window.requestAnimationFrame(() => errorSummary.current?.focus());
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
          {error ? <div ref={errorSummary} role="alert" tabIndex={-1} className="rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-destructive">
            <div className="flex items-start gap-2"><AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" /><div className="space-y-2"><p className="font-semibold text-destructive">{error}</p>
              {generalErrors.map((message, index) => <p key={index} className="text-foreground">{message}</p>)}
              {Object.keys(fieldErrors).length ? <ul className="space-y-1">{Object.entries(fieldErrors).map(([name, messages]) => <li key={name}><button type="button" className="text-left text-destructive underline underline-offset-2" onClick={() => { const field = document.getElementsByName(name)[0]; field?.focus(); }}>{fieldLabels[name]}: {messages.join(" ")}</button></li>)}</ul> : null}
            </div></div>
          </div> : null}
          <AuthField id="name" name="name" error={fieldErrors.name} label="Full name" type="text" autoComplete="name" placeholder="Your full name" icon={<UserRound aria-hidden="true" className="size-4" />} required />
          <div className="grid gap-5 sm:grid-cols-2">
            <AuthField id="username" name="username" error={fieldErrors.username} label="Username" type="text" autoComplete="username" placeholder="Choose a username" required />
            <AuthField id="technician-number" name="technician_number" error={fieldErrors.technician_number} label="Technician number" type="text" placeholder="Your technician number" required />
          </div>
          <AuthField id="password" name="password" error={fieldErrors.password} label="Password" type="password" autoComplete="new-password" placeholder="Choose a password" icon={<LockKeyhole aria-hidden="true" className="size-4" />} required />
          <div className="grid gap-5 sm:grid-cols-2">
            <AuthField id="contact" name="contact" error={fieldErrors.contact} label="Contact number" type="tel" autoComplete="tel" placeholder="Your phone number" required />
            <AuthField id="discipline" name="discipline" error={fieldErrors.discipline} label="Discipline" type="text" placeholder="Your specialty" required />
          </div>
          <AuthField id="qualification" name="qualification" error={fieldErrors.qualification} label="Qualification (optional)" type="text" placeholder="Your qualification" />
          <AuthField id="iqama-no" name="iqama_no" error={fieldErrors.iqama_no} label="Iqama number (optional)" type="text" placeholder="Your iqama number" maxLength={50} />
          <AuthField id="email" name="email" error={fieldErrors.email} label="Work email (optional)" type="email" autoComplete="email" placeholder="name@company.com" icon={<Mail aria-hidden="true" className="size-4" />} />
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
