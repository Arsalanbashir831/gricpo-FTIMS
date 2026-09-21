"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  sampleTechnicians,
  type TechnicianRecord,
  type TechnicianStatus,
} from "@/features/technicians/data/sample-technicians";
import {
  saveTechnicianDraft,
  useTechnicianDrafts,
} from "@/stores/technician-drafts";
import { activeReferenceNames } from "@/features/settings/data/reference-data";
import { useReferenceCatalog } from "@/stores/reference-data";

const selectClassName =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-500";

function Field({
  label,
  name,
  children,
}: {
  label: string;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={name}
      className="grid gap-1.5 text-sm font-medium text-slate-700"
    >
      {label}
      {children}
    </label>
  );
}

export function AddTechnicianScreen({
  initialRecord,
}: {
  initialRecord?: TechnicianRecord;
}) {
  const router = useRouter();
  const disciplines = activeReferenceNames(
    useReferenceCatalog(),
    "disciplines",
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const text = (key: string) => String(form.get(key) ?? "").trim();
    const skills = text("skills")
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
    const discipline = text("discipline");
    const record: TechnicianRecord = {
      id:
        initialRecord?.id ??
        `TECH-DRAFT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      name: text("name"),
      discipline,
      qualification: text("qualification"),
      phone: text("phone"),
      email: text("email"),
      location: text("location"),
      joinedOn: text("joinedOn"),
      reportingTo: text("reportingTo"),
      status: text("status") as TechnicianStatus,
      skills: [discipline, ...skills.filter((skill) => skill !== discipline)],
      certifications: text("qualification")
        ? [
            {
              name: discipline,
              level: text("qualification"),
              expiresOn: text("certificateExpiry") || "2027-12-31",
            },
          ]
        : [],
      assignedEquipmentIds: initialRecord?.assignedEquipmentIds ?? [],
      activeProjects: initialRecord?.activeProjects ?? [],
      history: initialRecord
        ? [
            {
              date: new Date().toISOString().slice(0, 10),
              action: "Profile updated",
              detail: "Browser-only change",
            },
            ...initialRecord.history,
          ]
        : [
            {
              date: text("joinedOn"),
              action: "Profile draft created",
              detail: "Browser-only technician profile",
            },
          ],
    };
    try {
      saveTechnicianDraft(record);
      router.push("/supervisor/technicians");
    } catch {
      setError("The technician draft could not be saved in this browser.");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4 sm:p-6 lg:p-7">
      <div>
        <Link
          href="/supervisor/technicians"
          className="mb-3 inline-flex items-center gap-1 text-sm text-sky-700 hover:underline"
        >
          <ArrowLeft className="size-4" /> Technicians
        </Link>
        <div className="flex items-center gap-3">
          <UsersRound className="size-8 text-sky-700" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {initialRecord ? "Edit technician" : "Add technician"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {initialRecord
                ? `Update ${initialRecord.name}’s profile in this browser.`
                : "Create a sample profile. The technician ID will come from the backend after integration."}
            </p>
          </div>
        </div>
      </div>
      <form onSubmit={submit} className="space-y-5">
        <Card className="border-0 shadow-none ring-1 ring-slate-200/80">
          <CardHeader>
            <CardTitle>Profile and contact</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name *" name="name">
              <Input
                id="name"
                name="name"
                required
                maxLength={100}
                defaultValue={initialRecord?.name}
                placeholder="e.g. Ahmed Khan"
              />
            </Field>
            <Field label="Email *" name="email">
              <Input
                id="email"
                name="email"
                type="email"
                required
                maxLength={150}
                defaultValue={initialRecord?.email}
                placeholder="name@gripco.com"
              />
            </Field>
            <Field label="Phone *" name="phone">
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                maxLength={30}
                defaultValue={initialRecord?.phone}
                placeholder="+92 300 1234567"
              />
            </Field>
            <Field label="Location *" name="location">
              <Input
                id="location"
                name="location"
                required
                maxLength={120}
                defaultValue={initialRecord?.location}
                placeholder="City, country"
              />
            </Field>
            <Field label="Joined date *" name="joinedOn">
              <Input
                id="joinedOn"
                name="joinedOn"
                type="date"
                required
                defaultValue={initialRecord?.joinedOn}
              />
            </Field>
            <Field label="Reporting to *" name="reportingTo">
              <Input
                id="reportingTo"
                name="reportingTo"
                required
                maxLength={100}
                defaultValue={initialRecord?.reportingTo}
                placeholder="Supervisor or tech lead"
              />
            </Field>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-none ring-1 ring-slate-200/80">
          <CardHeader>
            <CardTitle>Skills and certification</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Primary discipline *" name="discipline">
              <select
                id="discipline"
                name="discipline"
                required
                defaultValue={initialRecord?.discipline ?? ""}
                className={selectClassName}
              >
                <option value="" disabled>
                  Select discipline
                </option>
                {disciplines.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Field>
            <Field label="Qualification *" name="qualification">
              <Input
                id="qualification"
                name="qualification"
                required
                maxLength={100}
                defaultValue={initialRecord?.qualification}
                placeholder="e.g. ASNT Level II"
              />
            </Field>
            <Field label="Additional skills" name="skills">
              <Input
                id="skills"
                name="skills"
                maxLength={250}
                defaultValue={initialRecord?.skills.join(", ")}
                placeholder="Comma-separated skills"
              />
            </Field>
            <Field label="Certification expiry" name="certificateExpiry">
              <Input
                id="certificateExpiry"
                name="certificateExpiry"
                type="date"
                defaultValue={initialRecord?.certifications[0]?.expiresOn}
              />
            </Field>
            <Field label="Status *" name="status">
              <select
                id="status"
                name="status"
                required
                defaultValue={initialRecord?.status ?? "Active"}
                className={selectClassName}
              >
                <option>Active</option>
                <option>On leave</option>
                <option>Inactive</option>
                <option>Training</option>
              </select>
            </Field>
          </CardContent>
        </Card>
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700"
          >
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button
            nativeButton={false}
            variant="outline"
            render={<Link href="/supervisor/technicians" />}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="size-4" />{" "}
            {saving ? "Saving…" : "Save browser draft"}
          </Button>
        </div>
        <p className="text-right text-xs text-muted-foreground">
          This profile is stored only in this browser until backend integration.
        </p>
      </form>
    </div>
  );
}

export function EditTechnicianScreen({ id }: { id: string }) {
  const drafts = useTechnicianDrafts();
  const technician =
    drafts.find((item) => item.id === id) ??
    sampleTechnicians.find((item) => item.id === id);
  if (!technician)
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Technician not found</h1>
        <Link
          href="/supervisor/technicians"
          className="mt-3 inline-block text-sm text-sky-700 underline"
        >
          Back to technicians
        </Link>
      </div>
    );
  return <AddTechnicianScreen key={technician.id} initialRecord={technician} />;
}
