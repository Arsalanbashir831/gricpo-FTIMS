import type { Equipment } from "@/features/equipment/types";
import type { Technician } from "@/features/technicians/types";

export interface AllocationAccessory { id: number; accessory: number; description: string; quantity: number; notes: string }
export interface AllocationTechnician { id: number; technician_number: string; name: string }
export interface Allocation {
  id: number; equipment: number; equipment_number: string; equipment_description: string; equipment_category: string;
  equipment_brand: string; equipment_model: string; equipment_serial_number: string; equipment_status: string;
  equipment_photo: string | null; equipment_qr_token: string; calibration_due: string | null;
  custodian: number; custodian_name: string; custodian_number: string; additional_technicians: number[];
  additional_technician_details: AllocationTechnician[]; project_site: number; project_site_name: string;
  client_name: string; allocated_at: string; expected_return: string | null; closed_at: string | null;
  purpose: string; status: string; status_name: string; allocated_by: number; accessories: AllocationAccessory[];
}
export interface AllocationPage { count: number; next: string | null; previous: string | null; results: Allocation[] }
export interface Accessory { id: number; accessory_number: string; description: string; accessory_type: string | null; accessory_type_name: string }
export interface AllocationProject { id: number; name: string; client_name: string; location: string }
export interface AllocationReferences {
  equipment: Equipment[]; technicians: Technician[]; projects: AllocationProject[]; accessories: Accessory[];
}
export interface AllocationInput {
  equipment_id: number; custodian_id: number; project_site_id: number; purpose: string;
  expected_return: string | null; additional_technician_ids: number[];
  accessories: Array<{ accessory_id: number; quantity: number; notes?: string }>;
}
