"use client";

import { useEffect, useState } from "react";
import { CalibrationForm } from "@/features/calibration/components/calibration-form";
import type { Calibration } from "@/features/calibration/types";
import { authFetch } from "@/lib/api/client";

export function EditCalibrationScreen({ id }: { id: string }) {
  const [record, setRecord] = useState<Calibration | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { authFetch(`/api/calibrations/${id}`).then(async (response) => {
    if (!response.ok) throw new Error(); setRecord(await response.json());
  }).catch(() => setError("Calibration could not be loaded.")); }, [id]);
  if (error) return <p role="alert" className="p-6 text-sm text-destructive">{error}</p>;
  if (!record) return <p className="p-6 text-sm text-muted-foreground">Loading calibration…</p>;
  return <CalibrationForm calibration={record} />;
}
