"use client";

import Image from "next/image";
import { Camera } from "lucide-react";
import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api/client";

export function EquipmentPhoto({ src, alt, className = "size-full object-contain" }: { src: string | null; alt: string; className?: string }) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!src) return;
    let active = true; let url: string | null = null;
    authFetch(src).then(async (response) => { if (!response.ok) return; url = URL.createObjectURL(await response.blob()); if (active) setObjectUrl(url); }).catch(() => {});
    return () => { active = false; if (url) URL.revokeObjectURL(url); };
  }, [src]);
  return objectUrl ? <Image src={objectUrl} alt={alt} width={480} height={320} unoptimized className={className} /> : <div className="text-center text-slate-400"><Camera className="mx-auto size-9" /><p className="mt-1 text-xs">No photo</p></div>;
}
