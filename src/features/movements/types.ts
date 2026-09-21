import type { Allocation } from "@/features/allocations/types";
import type { Technician } from "@/features/technicians/types";
import type { AllocationProject } from "@/features/allocations/types";

export interface MissingAccessory {
  allocation_accessory: number;
  accessory: number;
  description: string;
  allocated_quantity: number;
  quantity: number;
}

export interface EquipmentReturn {
  id: number;
  allocation: number;
  equipment: number;
  equipment_number: string;
  equipment_description: string;
  technician: number;
  technician_name: string;
  returned_at: string;
  condition: string;
  returning_from: number;
  returning_from_name: string;
  expected_return: string | null;
  requires_maintenance: boolean;
  missing_accessories: MissingAccessory[];
  received_by: number;
  received_by_name: string;
  remarks: string;
}

export interface Transfer {
  id: number;
  transfer_number: string;
  source_allocation: number;
  equipment: number;
  equipment_number: string;
  equipment_description: string;
  from_technician: number;
  from_technician_name: string;
  to_technician: number;
  to_technician_name: string;
  project_site: number;
  project_site_name: string;
  transfer_date: string;
  reason: string;
  remarks: string;
  status: "pending" | "approved" | "rejected";
  status_name: string;
  requested_by: number;
  requested_by_name: string;
  approved_by: number | null;
  approved_by_name: string | null;
  reviewed_at: string | null;
  destination_allocation: number | null;
}

export interface Page<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface MovementReferences {
  allocations: Allocation[];
  technicians: Technician[];
  projects: AllocationProject[];
}
