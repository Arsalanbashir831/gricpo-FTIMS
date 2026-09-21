export type ProjectStatus = "Active" | "Planning" | "Mobilization" | "On Hold" | "Completed";
export type ProjectRecord = {
  id: string;
  name: string;
  client: string;
  region: string;
  city: string;
  country: string;
  address: string;
  latitude: number;
  longitude: number;
  equipmentAllocated: number;
  technicians: string[];
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  projectManager: string;
  siteContact: string;
  notes: string;
};

export const projectSampleRecords: ProjectRecord[] = [
  { id: "ras-tanura-refinery", name: "Ras Tanura Refinery", client: "Saudi Aramco", region: "Eastern Province", city: "Ras Tanura", country: "Saudi Arabia", address: "Ras Tanura refinery site", latitude: 26.64, longitude: 50.16, equipmentAllocated: 28, technicians: ["Ahmed Khan", "Imran Ali", "Faisal Saleh", "Khalid", "Sameer"], status: "Active", startDate: "2026-09-01", endDate: "2026-11-30", projectManager: "Ahmed Khan", siteContact: "Khalid Al-Qahtani", notes: "Field testing for new CDU unit. Additional equipment may be required in October." },
  { id: "jafurah-gas-project", name: "Jafurah Gas Project", client: "Aramco", region: "Eastern Province", city: "Jafurah", country: "Saudi Arabia", address: "Jafurah gas field", latitude: 25.07, longitude: 49.25, equipmentAllocated: 24, technicians: ["Waqas Ahmad", "Sameer", "Irfan Sheikh"], status: "Active", startDate: "2026-08-15", endDate: "2026-12-15", projectManager: "Waqas Ahmad", siteContact: "Site operations", notes: "Gas field inspection and testing." },
  { id: "yanbu-petrochemical", name: "Yanbu Petrochemical", client: "SABIC", region: "Western Province", city: "Yanbu", country: "Saudi Arabia", address: "Yanbu industrial area", latitude: 24.09, longitude: 38.06, equipmentAllocated: 18, technicians: ["Danish Iqbal", "Rashid", "Ali"], status: "Active", startDate: "2026-09-01", endDate: "2026-10-30", projectManager: "Danish Iqbal", siteContact: "Plant coordinator", notes: "Petrochemical inspection work." },
  { id: "shaybah-expansion", name: "Shaybah Expansion", client: "Aramco", region: "Eastern Province", city: "Shaybah", country: "Saudi Arabia", address: "Shaybah field", latitude: 22.51, longitude: 53.95, equipmentAllocated: 32, technicians: ["Bilal Hussain", "Imran Ali", "Ahmed Saleh"], status: "Planning", startDate: "2026-09-20", endDate: "2027-01-20", projectManager: "Bilal Hussain", siteContact: "Site coordinator", notes: "Mobilization and planning in progress." },
  { id: "jubail-industrial-city", name: "Jubail Industrial City", client: "SABIC", region: "Eastern Province", city: "Jubail", country: "Saudi Arabia", address: "Jubail industrial city", latitude: 27.02, longitude: 49.66, equipmentAllocated: 16, technicians: ["Muhammad Ali", "Farhan"], status: "Active", startDate: "2026-09-10", endDate: "2026-12-10", projectManager: "Muhammad Ali", siteContact: "Plant coordinator", notes: "Industrial testing across operating facilities." },
  { id: "neom-city-infrastructure", name: "Neom City Infrastructure", client: "NEOM", region: "Northern Region", city: "Neom", country: "Saudi Arabia", address: "NEOM project area", latitude: 28.24, longitude: 35.2, equipmentAllocated: 12, technicians: ["Irfan Sheikh", "Muhammad Ali", "Sameer"], status: "Mobilization", startDate: "2026-10-01", endDate: "2026-12-31", projectManager: "Irfan Sheikh", siteContact: "Project office", notes: "Infrastructure testing preparation." },
  { id: "doha-lng-facility", name: "Doha LNG Facility", client: "QatarEnergy", region: "Qatar", city: "Doha", country: "Qatar", address: "Doha LNG facility", latitude: 25.29, longitude: 51.53, equipmentAllocated: 14, technicians: ["Khalid", "Mohammed Farooq"], status: "Active", startDate: "2026-09-05", endDate: "2026-11-05", projectManager: "Khalid", siteContact: "Facility coordinator", notes: "LNG facility inspection." },
  { id: "al-ruwais-refinery", name: "Al Ruwais Refinery", client: "ADNOC", region: "Abu Dhabi", city: "Al Ruwais", country: "United Arab Emirates", address: "Al Ruwais refinery", latitude: 24.08, longitude: 52.73, equipmentAllocated: 20, technicians: ["Hassan", "Danish", "Ahmed Farooq"], status: "On Hold", startDate: "2026-08-01", endDate: "2026-09-30", projectManager: "Hassan", siteContact: "Site office", notes: "Awaiting site access confirmation." },
  { id: "basrah-oil-terminal", name: "Basrah Oil Terminal", client: "Iraq NOC", region: "Basrah", city: "Basrah", country: "Iraq", address: "Basrah oil terminal", latitude: 30.51, longitude: 47.81, equipmentAllocated: 10, technicians: ["Zahid Malik", "Ali"], status: "Mobilization", startDate: "2026-09-12", endDate: "2026-11-12", projectManager: "Zahid Malik", siteContact: "Terminal coordinator", notes: "Mobilization for terminal inspection." },
  { id: "duqm-refinery", name: "Duqm Refinery", client: "OQ", region: "Al Wusta", city: "Duqm", country: "Oman", address: "Duqm refinery", latitude: 19.67, longitude: 57.7, equipmentAllocated: 8, technicians: ["Farhan", "Junaid Khan"], status: "Completed", startDate: "2026-06-01", endDate: "2026-08-31", projectManager: "Farhan", siteContact: "Refinery coordinator", notes: "Final reports submitted." },
];

export function formatProjectDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}
export function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}
