"use client";

import { supervisorNavigation } from "@/config/dashboard/supervisor-navigation";
import { technicianNavigation } from "@/config/dashboard/technician-navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
type UserRole = "supervisor" | "technician";

interface DashboardSidebarProps {
  role: UserRole;
}

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname();

  const navigation =
    role === "supervisor"
      ? supervisorNavigation
      : technicianNavigation;

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r bg-background lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <div className="relative h-10 w-28">
          <Image
            src="/logo.avif"
            alt="GRIPCO"
            fill
            sizes="112px"
            loading="eager"
            className="object-contain"
          />
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href ||
            (item.href !== `/${role}` && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={[
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              ].join(" ")}
            >
              <Icon className="h-4 w-4" />

              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
