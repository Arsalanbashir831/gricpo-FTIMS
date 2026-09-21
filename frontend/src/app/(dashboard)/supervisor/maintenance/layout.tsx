import type { ReactNode } from "react";
import { MaintenanceNavigation } from "@/features/maintenance/components/maintenance-navigation";

export default function MaintenanceLayout({ children }: { children: ReactNode }) {
  return <><MaintenanceNavigation />{children}</>;
}
