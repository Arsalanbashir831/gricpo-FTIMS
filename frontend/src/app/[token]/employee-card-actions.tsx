"use client";
import { ExternalLink, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
export function EmployeeCardActions({ photoUrl }: { photoUrl: string }) { return <div className="mt-5 flex flex-wrap gap-2 print:hidden"><Button type="button" onClick={() => window.print()}><Printer className="size-4" /> Print employee card</Button><a href={photoUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"><ExternalLink className="size-4" /> Show profile picture</a></div>; }
