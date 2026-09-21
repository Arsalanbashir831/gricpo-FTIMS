export type ProjectStatus = "planned" | "active" | "on_hold" | "completed" | "cancelled";

export interface ProjectSite {
  id: number;
  name: string;
  client: number;
  client_name: string;
  location: string;
  status: ProjectStatus;
  status_name: string;
  start_date: string;
  end_date: string | null;
  equipment_count: number;
  technician_names: string[];
}

export interface ProjectSitePage {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProjectSite[];
}

export interface ClientReference {
  id: number;
  name: string;
  contact?: string;
}

export interface ProjectStatusReference {
  code: string;
  name: string;
}

export interface ProjectReferences {
  clients: ClientReference[];
  statuses: ProjectStatusReference[];
}

export interface ProjectSiteInput {
  name: string;
  client?: number;
  client_title?: string;
  location: string;
  status: ProjectStatus;
  start_date: string;
  end_date?: string | null;
}

export type LocationSearchResult = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  city: string;
  country: string;
};

