"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Save, UserRound, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { clearStoredTokens, getStoredRefreshToken } from "@/features/auth/client/token-storage";
import type { CurrentAccount } from "@/features/auth/types";
import type { Technician } from "@/features/technicians/types";
import { TechnicianPhoto } from "@/features/technicians/components/technician-photo";
import { authFetch } from "@/lib/api/client";

function Field({ label, name, children }: { label: string; name: string; children: ReactNode }) {
  return <label htmlFor={name} className="grid gap-1.5 text-sm font-medium text-slate-700">{label}{children}</label>;
}

export function TechnicianProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Technician | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string>();

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const refresh = getStoredRefreshToken();
      if (refresh) {
        await authFetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh }),
        }).catch(() => {});
      }
    } finally {
      clearStoredTokens();
      router.replace("/login");
      router.refresh();
    }
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const accountResponse = await authFetch("/api/auth/me");
        const account = await accountResponse.json() as CurrentAccount;
        if (!accountResponse.ok || account.role !== "technician" || account.approval_status !== "approved" || !account.technician) throw new Error("An approved technician account is required.");
        const profileResponse = await authFetch(`/api/technicians/${account.technician}`);
        const data = await profileResponse.json();
        if (!profileResponse.ok) throw new Error(data.detail || "Your profile could not be loaded.");
        if (active) setProfile(data as Technician);
      } catch (cause) { if (active) setError(cause instanceof Error ? cause.message : "Your profile could not be loaded."); }
      finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;
    setSaving(true); setError(""); setNotice("");
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "").trim();
    try {
      if (!(form.get("profile_photo") as File)?.size) form.delete("profile_photo");
      if (!text("certification_expiry")) form.delete("certification_expiry");
      const response = await authFetch(`/api/technicians/${profile.id}`, { method: "PATCH", body: form });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || Object.values(data)[0] || "Your profile could not be saved.");
      setProfile(data as Technician); setNotice("Your profile has been updated.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Your profile could not be saved."); }
    finally { setSaving(false); }
  }

  if (loading) return <p className="p-6 text-sm text-slate-500">Loading your profile…</p>;
  if (!profile) return <p role="alert" className="p-6 text-sm text-rose-700">{error}</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4 sm:p-6 lg:p-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-11 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
            <UserRound className="size-6" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              My technician profile
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Complete and maintain the information your supervisor uses for assignments.
            </p>
          </div>
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
      </header>
      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <BadgeCheck className="size-5" />
        <span>
          Your account is approved. Technician number: <strong>{profile.technician_number}</strong>
        </span>
      </div>
      <form onSubmit={submit} className="space-y-5">
        <Card className="border-0 shadow-none ring-1 ring-slate-200/80">
          <CardHeader>
            <CardTitle>Profile photo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-5">
            <TechnicianPhoto src={profile.profile_photo} preview={photoPreview} alt={`${profile.name} profile`} />
            <Field label="Choose profile picture" name="profile_photo">
              <Input
                id="profile_photo"
                name="profile_photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  setPhotoPreview(file ? URL.createObjectURL(file) : undefined);
                }}
              />
              <span className="text-xs font-normal text-slate-500">JPEG, PNG, or WebP.</span>
            </Field>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-none ring-1 ring-slate-200/80">
          <CardHeader>
            <CardTitle>Profile and contact</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name *" name="name">
              <Input id="name" name="name" required maxLength={200} defaultValue={profile.name} />
            </Field>
            <Field label="Work email" name="email">
              <Input id="email" name="email" type="email" maxLength={254} defaultValue={profile.email} />
            </Field>
            <Field label="Contact number *" name="contact">
              <Input id="contact" name="contact" type="tel" required maxLength={100} defaultValue={profile.contact} />
            </Field>
            <Field label="Location" name="location">
              <Input id="location" name="location" maxLength={200} defaultValue={profile.location} placeholder="City, country" />
            </Field>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-none ring-1 ring-slate-200/80">
          <CardHeader>
            <CardTitle>Skills and certification</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Primary discipline *" name="discipline">
              <Input id="discipline" name="discipline" required maxLength={150} defaultValue={profile.discipline} placeholder="e.g. UT / NDT" />
            </Field>
            <Field label="Qualification" name="qualification">
              <Input id="qualification" name="qualification" maxLength={500} defaultValue={profile.qualification} placeholder="e.g. ASNT Level II" />
            </Field>
            <Field label="Additional skills" name="skills">
              <Input id="skills" name="skills" maxLength={500} defaultValue={profile.skills} placeholder="Comma-separated skills" />
            </Field>
            <Field label="Certification expiry" name="certification_expiry">
              <Input id="certification_expiry" name="certification_expiry" type="date" defaultValue={profile.certification_expiry ?? ""} />
            </Field>
          </CardContent>
        </Card>
        {error ? <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{String(error)}</p> : null}
        {notice ? <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p> : null}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            <Save className="size-4" /> {saving ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
