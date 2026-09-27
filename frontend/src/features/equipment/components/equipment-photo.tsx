"use client";

import Image from "next/image";
import { Camera } from "lucide-react";
import { useEffect, useState } from "react";
import { getStoredAccessToken } from "@/features/auth/client/token-storage";

// Strip trailing /api so that the relative path from the backend (/api/equipment/…)
// is appended correctly — NEXT_PUBLIC_API_BASE_URL may already end with /api.
const API_ORIGIN = 'https://apiftims.gripcosaudia.com'

function resolvePhotoUrl(src: string): string {
  // If the backend returned a relative path (e.g. /api/equipment/2/photo/),
  // prepend the backend origin so the request goes to the right server.
  if (src.startsWith("/")) return `${API_ORIGIN}${src}`;
  return src;
}

export function EquipmentPhoto({ src, alt, className = "size-full object-contain" }: { src: string | null; alt: string; className?: string }) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!src) return;
    let active = true;
    let url: string | null = null;

    const access = getStoredAccessToken();
    fetch(resolvePhotoUrl(src), {
      headers: { ...(access ? { Authorization: `Bearer ${access}` } : {}) },
    })
      .then(async (response) => {
        if (!response.ok) return;
        url = URL.createObjectURL(await response.blob());
        if (active) setObjectUrl(url);
      })
      .catch(() => { });

    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [src]);
  return objectUrl ? <Image src={objectUrl} alt={alt} width={480} height={320} unoptimized className={className} /> : <div className="text-center text-slate-400"><Camera className="mx-auto size-9" /><p className="mt-1 text-xs">No photo</p></div>;
}
