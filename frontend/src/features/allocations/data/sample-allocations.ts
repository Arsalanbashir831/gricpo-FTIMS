export type AllocationStatus = "Active" | "Returned" | "Overdue";
export type AllocationRecord = {
  id: string;
  equipmentIds: string[];
  primaryTechnicianId: string;
  additionalTechnicianIds: string[];
  projectSite: string;
  issueDate: string;
  expectedReturnDate: string;
  purpose: string;
  accessories: Record<string, string[]>;
  status: AllocationStatus;
};

export const technicianOptions = [
  { id: "TECH-001", name: "Ahmed Khan" },
  { id: "TECH-014", name: "Muhammad Ali" },
  { id: "TECH-021", name: "Irfan Sheikh" },
  { id: "TECH-032", name: "Waqas Ahmad" },
  { id: "TECH-045", name: "Danish Iqbal" },
  { id: "TECH-052", name: "Imran Ali" },
  { id: "TECH-060", name: "Bilal Hussain" },
  { id: "TECH-071", name: "Sameer" },
];
export const projectSiteOptions = [
  "SPARK – Ras Tanura", "Jafurah", "Shaybah", "SPARK Abqaiq", "Yanbu",
];
export const defaultAccessories = [
  "Carrying Case", "Battery (Main)", "Battery (Spare)", "Power Charger",
  "USB Cable", "Calibration Standard (SS316)", "Calibration Standard (Ti)",
  "User Manual", "Protective Cover",
];

export const allocationSampleRecords: AllocationRecord[] = [
  { id: "ALLOC-2026-045", equipmentIds: ["GRIP-PMI-007", "GRIP-MT-006"], primaryTechnicianId: "TECH-001", additionalTechnicianIds: ["TECH-021", "TECH-045"], projectSite: "SPARK – Ras Tanura", issueDate: "2026-09-12", expectedReturnDate: "2026-09-20", purpose: "PMI testing for piping materials at Ras Tanura site.", accessories: { "GRIP-PMI-007": ["Carrying Case", "Battery (Main)", "Power Charger", "Calibration Standard (SS316)", "User Manual"], "GRIP-MT-006": ["Carrying Case", "User Manual"] }, status: "Active" },
  { id: "ALLOC-2026-044", equipmentIds: ["GRIP-UT-011"], primaryTechnicianId: "TECH-052", additionalTechnicianIds: [], projectSite: "Jafurah", issueDate: "2026-09-11", expectedReturnDate: "2026-09-25", purpose: "Ultrasonic inspection at Jafurah.", accessories: { "GRIP-UT-011": ["Carrying Case", "Battery (Main)"] }, status: "Active" },
  { id: "ALLOC-2026-042", equipmentIds: ["GRIP-PWHT-002"], primaryTechnicianId: "TECH-060", additionalTechnicianIds: ["TECH-071"], projectSite: "Shaybah", issueDate: "2026-09-09", expectedReturnDate: "2026-09-22", purpose: "Temperature recording during heat treatment.", accessories: { "GRIP-PWHT-002": ["Carrying Case", "Power Charger"] }, status: "Active" },
  { id: "ALLOC-2026-040", equipmentIds: ["GRIP-HDT-004"], primaryTechnicianId: "TECH-032", additionalTechnicianIds: [], projectSite: "SPARK Abqaiq", issueDate: "2026-09-08", expectedReturnDate: "2026-09-18", purpose: "Hardness testing at Abqaiq.", accessories: { "GRIP-HDT-004": ["Carrying Case", "User Manual"] }, status: "Active" },
  { id: "ALLOC-2026-038", equipmentIds: ["GRIP-BOR-001"], primaryTechnicianId: "TECH-045", additionalTechnicianIds: ["TECH-001"], projectSite: "Yanbu", issueDate: "2026-09-07", expectedReturnDate: "2026-09-17", purpose: "Visual inspection at Yanbu.", accessories: { "GRIP-BOR-001": ["Carrying Case", "Battery (Spare)"] }, status: "Overdue" },
];

export function technicianName(id: string) {
  return technicianOptions.find((item) => item.id === id)?.name ?? id;
}
export function formatAllocationDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}
export function daysBetween(start: string, end: string) {
  const oneDay = 86_400_000;
  return Math.max(0, Math.floor((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / oneDay));
}
