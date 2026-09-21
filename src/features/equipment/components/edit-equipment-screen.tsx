"use client";

import { useEffect, useState } from "react";
import { EquipmentForm } from "@/features/equipment/components/equipment-form";
import type { Equipment } from "@/features/equipment/types";
import { authFetch } from "@/lib/api/client";

export function EditEquipmentScreen({ id }: { id: string }) {
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    authFetch(`/api/equipment/${encodeURIComponent(id)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error();
        setEquipment(await response.json());
      })
      .catch(() => setError("Equipment could not be loaded."));
  }, [id]);
  if (error) return <p role="alert" className="p-6 text-sm text-destructive">{error}</p>;
  if (!equipment) return <p className="p-6 text-sm text-muted-foreground">Loading equipment…</p>;
  return <EquipmentForm equipment={equipment} />;
}
