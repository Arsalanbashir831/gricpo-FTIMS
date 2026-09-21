"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ClipboardPlus, FileWarning, Wrench } from "lucide-react";

const items = [
  { label: "Stats", href: "/supervisor/maintenance", icon: BarChart3 },
  { label: "Add maintenance request", href: "/supervisor/maintenance/requests/new", icon: ClipboardPlus },
  { label: "Add fault report", href: "/supervisor/maintenance/fault-reports/new", icon: FileWarning },
  { label: "Add service report", href: "/supervisor/maintenance/service-reports/new", icon: Wrench },
];

export function MaintenanceNavigation() {
  const pathname = usePathname();
  return <nav aria-label="Maintenance sections" className="flex gap-2 overflow-x-auto border-b border-slate-200 px-4 pt-4 sm:px-6 lg:px-7">
    {items.map(({ label, href, icon: Icon }) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors ${pathname === href ? "border-sky-600 text-sky-700" : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900"}`}><Icon className="size-4" />{label}</Link>)}
  </nav>;
}
