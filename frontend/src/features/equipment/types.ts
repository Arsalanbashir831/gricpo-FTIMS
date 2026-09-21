export interface EquipmentReference {
  id?: number;
  code?: string;
  name: string;
}

export interface CurrentAllocation {
  id: number;
  project_site: number;
  project_site_name: string;
  custodian: number;
  custodian_name: string;
}

export interface Equipment {
  id: number;
  equipment_number: string;
  description: string;
  category: number;
  category_name: string;
  brand: string;
  model: string;
  serial_number: string;
  photo: string | null;
  notes: string;
  status: string;
  status_name: string;
  qr_token: string;
  calibration_due: string | null;
  active_allocations: number[];
  current_allocation: CurrentAllocation | null;
}

export interface EquipmentPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: Equipment[];
}

export interface EquipmentSummary {
  total: number;
  allocated: number;
  maintenance: number;
  out_of_service: number;
  calibration_expired: number;
  calibration_due: number;
  calibration_missing: number;
}

export interface EquipmentInput {
  equipment_number: string;
  description: string;
  category: number;
  brand: string;
  model: string;
  serial_number: string;
  status: string;
  notes: string;
}

export type PublicEquipment = Pick<Equipment,
  "qr_token" | "equipment_number" | "description" | "category_name" | "brand" | "model" |
  "serial_number" | "photo" | "status_name" | "calibration_due"
>;
