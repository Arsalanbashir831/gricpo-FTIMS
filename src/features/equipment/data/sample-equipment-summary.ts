export type EquipmentSummaryMetric = { label: string; value: number; detail: string; kind: string; color: string };

export const equipmentCategories = [
  { name: "PMI / XRF", value: 45, color: "#0ea5e9" },
  { name: "UT / NDT", value: 62, color: "#10b981" },
  { name: "PWHT", value: 38, color: "#fbbf24" },
  { name: "Hardness", value: 28, color: "#06b6d4" },
  { name: "Inspection", value: 34, color: "#f43f5e" },
  { name: "Metallography", value: 18, color: "#8b5cf6" },
  { name: "Other", value: 60, color: "#94a3b8" },
];
export const equipmentSummaryMetrics: EquipmentSummaryMetric[] = [
  {
    label: "Total equipment",
    value: equipmentCategories.reduce((sum, category) => sum + category.value, 0),
    detail: "Across all categories",
    kind: "ClipboardList",
    color: "bg-sky-500",
  },
  {
    label: "Available",
    value: 102,
    detail: "35.8% of equipment",
    kind: "CheckCircle2",
    color: "bg-emerald-500",
  },
  {
    label: "Allocated",
    value: 126,
    detail: "44.2% of equipment",
    kind: "Users",
    color: "bg-orange-500",
  },
  {
    label: "Calibration due",
    value: 14,
    detail: "Next 30 days",
    kind: "CalendarClock",
    color: "bg-amber-500",
  },
  {
    label: "Calibration expired",
    value: 3,
    detail: "Needs attention",
    kind: "CalendarX2",
    color: "bg-rose-500",
  },
  {
    label: "Under repair",
    value: 8,
    detail: "Being serviced",
    kind: "Wrench",
    color: "bg-violet-500",
  },
  {
    label: "Overdue return",
    value: 16,
    detail: "Past expected date",
    kind: "Siren",
    color: "bg-red-500",
  },
];
