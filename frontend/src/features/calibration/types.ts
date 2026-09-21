export interface Calibration {
  id: number;
  equipment: number;
  equipment_number: string;
  equipment_description: string;
  equipment_category: string;
  brand?: string;
  model?: string;
  site_name?: string;
  certificate_number: string;
  calibration_date: string;
  due_date: string;
  certificate: string | null;
  provider: string;
  notes: string;
  revoked: boolean;
  status: string;
  validity_status: "valid" | "expired" | "scheduled" | "revoked";
}

export interface CalibrationPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: Calibration[];
}

export interface UpcomingBuckets {
  days_0_7: number;
  days_8_14: number;
  days_15_30: number;
  days_over_30: number;
}

export interface CalibrationSummary {
  total: number;
  equipment_tracked: number;
  valid: number;
  due_soon: number;
  expired: number;
  scheduled: number;
  revoked: number;
  completed_this_year: number;
  upcoming_buckets?: UpcomingBuckets;
}

export interface CalibrationEquipmentOption {
  id: number;
  equipment_number: string;
  description: string;
  category_name: string;
}

export interface SiteReferenceOption {
  id: number;
  name: string;
}

