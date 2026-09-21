"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { UserRound } from "lucide-react";
import { authFetch } from "@/lib/api/client";

export function TechnicianPhoto({ src, alt, preview }: { src: string | null; alt: string; preview?: string }) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!src || preview) return;
    let active = true;
    let url: string | null = null;
    authFetch(src).then(async (response) => {
      if (!response.ok) return;
      url = URL.createObjectURL(await response.blob());
      if (active) setObjectUrl(url);
    }).catch(() => {});
    return () => { active = false; if (url) URL.revokeObjectURL(url); };
  }, [preview, src]);

  const image = preview || objectUrl;
  return <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-slate-400">{image ? <Image src={image} alt={alt} width={112} height={112} unoptimized className="size-full object-cover" /> : <UserRound className="size-10" />}</div>;
}
