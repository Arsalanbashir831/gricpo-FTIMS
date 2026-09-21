export interface ReferenceOption { id?: number; code?: string; name: string }
export interface EquipmentOption { id: number; equipment_number: string; description: string }

export interface MaintenanceRequest {
  id: number; request_number: string; equipment: number; equipment_number: string;
  fault_report: number | null; requested_by: number; requested_by_name: string; requested_at: string;
  description: string; fault_type: string; target_date: string | null; notes: string;
  priority: string; priority_name: string; status: string; status_name: string;
}
export interface FaultReport {
  id: number; report_number: string; equipment: number; equipment_number: string;
  description: string; reported_by: number; reported_by_name: string; reported_at: string;
  fault_type: string; priority: string; priority_name: string; observations: string;
  status: string; status_name: string;
}
export interface ServiceReport {
  id: number; service_number: string; equipment: number; equipment_number: string;
  maintenance_request: number | null; service_type: string; service_type_name: string;
  service_date: string; provider: string; cost_usd: string; downtime: string;
  downtime_hours: number; result: string; result_name: string; work_performed: string;
  parts_replaced: string; notes: string;
}
export interface ApiPage<T> { count: number; next: string | null; previous: string | null; results: T[] }
export interface MaintenanceReferences {
  equipment: EquipmentOption[]; priorities: ReferenceOption[]; maintenanceStatuses: ReferenceOption[];
  faultStatuses: ReferenceOption[]; serviceTypes: ReferenceOption[]; serviceResults: ReferenceOption[];
  maintenanceRequests: Array<{ id: number; request_number: string; equipment: number }>;
}
export interface MaintenanceSummary {
  open_requests: number; in_repair: number; completed_30_days: number; overdue: number;
  average_downtime_hours: number; cost_30_days: string | number; average_turnaround_days: number;
  first_time_fix_rate: number; fault_types: Array<{ fault_type: string; value: number }>;
}
