export type ReportStatusCode = "draft" | "submitted" | "approved" | "rejected" | "revision_requested";
export interface ReportEquipment { id: number; equipment_number: string; description: string }
export interface TechnicianReport {
  id: number; report_number: string; technician: number; technician_name: string; allocation: number | null; equipment: number[];
  equipment_details: ReportEquipment[]; project_site: number; project_site_name: string; client: number;
  remarks: string; test_method: string; test_methods: string[]; test_date: string; report_file: string | null; status: ReportStatusCode;
  assigned_administrator: number | null; assigned_administrator_name: string; submitted_at: string | null;
  reviewed_at: string | null; review_notes: string; qr_code: string; verification_token: string;
}
export interface ReportPage { count: number; next: string | null; previous: string | null; results: TechnicianReport[] }
