// config/dashboard/supervisor-navigation.ts

import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  FolderKanban,
  FileText,
  Wrench,
  CalendarCheck2,
  ArrowLeftRight,
  Settings2,
} from "lucide-react";

export const supervisorNavigation = [
  {
    title: "Dashboard",
    href: "/supervisor",
    icon: LayoutDashboard,
  },
  {
    title: "Equipment",
    href: "/supervisor/equipment",
    icon: Package,
  },
  {
    title: "Allocations",
    href: "/supervisor/allocations",
    icon: ClipboardList,
  },
  {
    title: "Returns / Transfers",
    href: "/supervisor/movements",
    icon: ArrowLeftRight,
  },
  {
    title: "Technicians",
    href: "/supervisor/technicians",
    icon: Users,
  },
  {
    title: "Projects",
    href: "/supervisor/projects",
    icon: FolderKanban,
  },
  {
    title: "Reports",
    href: "/supervisor/reports",
    icon: FileText,
  },
  {
    title: "Calibration",
    href: "/supervisor/calibration",
    icon: CalendarCheck2,
  },
  {
    title: "Maintenance",
    href: "/supervisor/maintenance",
    icon: Wrench,
  },
  {
    title: "Master Data / Settings",
    href: "/supervisor/settings",
    icon: Settings2,
  },
];
