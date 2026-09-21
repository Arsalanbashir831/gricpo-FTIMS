import { equipmentCategories, equipmentSummaryMetrics, type EquipmentSummaryMetric } from "@/features/equipment/data/sample-equipment-summary";

const statuses = [
  { name: "Available", value: 102, color: "#10b981" },
  { name: "Allocated", value: 126, color: "#f97316" },
  { name: "Calibration", value: 14, color: "#0ea5e9" },
  { name: "Repair", value: 8, color: "#8b5cf6" },
  { name: "Other", value: 35, color: "#f43f5e" },
];
const calibrationDue = [
  { id: "GRIP-PMI-007", description: "X-MET8000", due: "21 Sep 2026", days: 3 },
  {
    id: "GRIP-UT-011",
    description: "Krautkramer UT",
    due: "26 Sep 2026",
    days: 8,
  },
  {
    id: "GRIP-HDT-004",
    description: "Equotip 550",
    due: "1 Oct 2026",
    days: 13,
  },
  {
    id: "GRIP-PWHT-002",
    description: "Chino Recorder",
    due: "4 Oct 2026",
    days: 16,
  },
  { id: "GRIP-PT-003", description: "UV Lamp", due: "6 Oct 2026", days: 18 },
];
const allocated = [
  {
    id: "GRIP-PMI-005",
    description: "X-MET8000",
    custodian: "Ahmed Khan",
    site: "Ras Tanura",
    since: "10 Sep 2026",
    returnDate: "20 Sep 2026",
  },
  {
    id: "GRIP-UT-011",
    description: "UT Machine",
    custodian: "Imran Ali",
    site: "Jafurah",
    since: "11 Sep 2026",
    returnDate: "25 Sep 2026",
  },
  {
    id: "GRIP-HDT-004",
    description: "UCI Hardness",
    custodian: "Waqas Ahmad",
    site: "SPARK Abqaiq",
    since: "8 Sep 2026",
    returnDate: "18 Sep 2026",
  },
  {
    id: "GRIP-PWHT-002",
    description: "Chino Recorder",
    custodian: "Bilal Hussain",
    site: "Shaybah",
    since: "9 Sep 2026",
    returnDate: "22 Sep 2026",
  },
  {
    id: "GRIP-BOR-001",
    description: "Video Boroscope",
    custodian: "Danish",
    site: "Yanbu",
    since: "7 Sep 2026",
    returnDate: "17 Sep 2026",
  },
];
const overdue = [
  {
    id: "GRIP-BOR-001",
    description: "Video Boroscope",
    custodian: "Danish",
    due: "5 Sep 2026",
    days: 13,
  },
  {
    id: "GRIP-MT-006",
    description: "MT Yoke",
    custodian: "Khalid",
    due: "6 Sep 2026",
    days: 12,
  },
  {
    id: "GRIP-UT-003",
    description: "UT Thickness",
    custodian: "Sameer",
    due: "4 Sep 2026",
    days: 14,
  },
  {
    id: "GRIP-DFT-002",
    description: "DFT Gauge",
    custodian: "Farhan",
    due: "31 Aug 2026",
    days: 18,
  },
  {
    id: "GRIP-PT-005",
    description: "PT Kit",
    custodian: "Imran",
    due: "29 Aug 2026",
    days: 20,
  },
];
export type SupervisorDashboardData = {
  asOf: string;
  sample: boolean;
  categories: { name: string; value: number; color: string }[];
  statuses: { name: string; value: number; color: string }[];
  metrics: EquipmentSummaryMetric[];
  calibrationDue: { id: string; description: string; due: string; days: number }[];
  allocated: { id: string; description: string; custodian: string; site: string; since: string; returnDate: string }[];
  overdue: { id: string; description: string; custodian: string; due: string; days: number }[];
};

export const dashboardSampleData: SupervisorDashboardData = {
  asOf: "18 Sep 2026",
  sample: true,
  categories: equipmentCategories, statuses, metrics: equipmentSummaryMetrics, calibrationDue, allocated, overdue,
};
