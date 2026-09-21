// config/dashboard/technician-navigation.ts

import { ClipboardList, FileText, LayoutDashboard, UserRound } from "lucide-react";

export const technicianNavigation = [
  { title: "Dashboard", href: "/technician/dashboard", icon: LayoutDashboard },
  { title: "Submitted Reports", href: "/technician/reports", icon: FileText },
  { title: "My Allocations", href: "/technician/allocations", icon: ClipboardList },
  {
    title: "My Profile",
    href: "/technician/profile",
    icon: UserRound,
  },
];
