export type TechnicianApprovalStatus = "pending" | "approved" | "rejected" | "suspended";

export interface Technician {
  id: number;
  user: number;
  technician_number: string;
  name: string;
  email: string;
  contact: string;
  location: string;
  discipline: string;
  qualification: string;
  skills: string;
  certification_expiry: string | null;
  profile_photo: string | null;
  created_at: string;
  administrator: number | null;
  administrator_name: string;
  project_sites: number[];
  project_site_names: string[];
  status: TechnicianApprovalStatus;
  reviewed_by: number | null;
  reviewed_at: string | null;
  review_notes: string;
  assigned_equipment: number[];
}

export interface TechnicianPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: Technician[];
}

export interface TechnicianUpdate {
  name?: string;
  email?: string;
  contact?: string;
  location?: string;
  discipline?: string;
  qualification?: string;
  skills?: string;
  certification_expiry?: string | null;
  project_sites?: number[];
}
