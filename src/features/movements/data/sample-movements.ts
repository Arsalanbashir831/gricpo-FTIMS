export type ReturnCondition = "Good" | "Minor wear" | "Requires maintenance" | "Damaged";
export type ReturnRecord = {
  id: string;
  equipmentId: string;
  source: "Technician" | "Site";
  technicianId: string;
  site: string;
  returnDate: string;
  expectedReturnDate: string;
  condition: ReturnCondition;
  missingAccessories: string[];
  conditionNotes: string;
  remarks: string;
  status: "Completed";
};
export type TransferRecord = {
  id: string;
  equipmentId: string;
  transferDate: string;
  from: string;
  to: string;
  projectSite: string;
  reason: string;
  approvedBy: string;
  approvalDate: string;
  remarks: string;
  status: "Approved";
};
export const returnSamples: ReturnRecord[] = [
  { id: "RET-2026-004", equipmentId: "GRIP-PMI-007", source: "Technician", technicianId: "TECH-001", site: "", returnDate: "2026-09-12", expectedReturnDate: "2026-09-12", condition: "Good", missingAccessories: [], conditionNotes: "Equipment returned in good working condition.", remarks: "", status: "Completed" },
  { id: "RET-2026-003", equipmentId: "GRIP-UT-011", source: "Technician", technicianId: "TECH-052", site: "", returnDate: "2026-09-11", expectedReturnDate: "2026-09-11", condition: "Minor wear", missingAccessories: [], conditionNotes: "", remarks: "", status: "Completed" },
  { id: "RET-2026-002", equipmentId: "GRIP-PWHT-002", source: "Technician", technicianId: "TECH-060", site: "", returnDate: "2026-09-09", expectedReturnDate: "2026-09-09", condition: "Good", missingAccessories: [], conditionNotes: "", remarks: "", status: "Completed" },
  { id: "RET-2026-001", equipmentId: "GRIP-BOR-001", source: "Technician", technicianId: "TECH-045", site: "", returnDate: "2026-09-07", expectedReturnDate: "2026-09-07", condition: "Requires maintenance", missingAccessories: ["Battery"], conditionNotes: "Focus requires inspection.", remarks: "", status: "Completed" },
];
export const transferSamples: TransferRecord[] = [
  { id: "TRF-2026-005", equipmentId: "GRIP-HDT-004", transferDate: "2026-09-12", from: "TECH-001", to: "TECH-032", projectSite: "SPARK Abqaiq", reason: "Project requirement", approvedBy: "Abdul Ahad", approvalDate: "2026-09-12", remarks: "Transfer to support project activities at SPARK Abqaiq.", status: "Approved" },
  { id: "TRF-2026-004", equipmentId: "GRIP-UT-003", transferDate: "2026-09-10", from: "TECH-052", to: "TECH-071", projectSite: "Jafurah", reason: "Project requirement", approvedBy: "Abdul Ahad", approvalDate: "2026-09-10", remarks: "", status: "Approved" },
  { id: "TRF-2026-003", equipmentId: "GRIP-MT-006", transferDate: "2026-09-09", from: "TECH-032", to: "TECH-045", projectSite: "Yanbu", reason: "Technician reassignment", approvedBy: "Abdul Ahad", approvalDate: "2026-09-09", remarks: "", status: "Approved" },
  { id: "TRF-2026-002", equipmentId: "GRIP-DFT-002", transferDate: "2026-09-07", from: "TECH-021", to: "TECH-052", projectSite: "SPARK – Ras Tanura", reason: "Project requirement", approvedBy: "Abdul Ahad", approvalDate: "2026-09-07", remarks: "", status: "Approved" },
];
