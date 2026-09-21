import type { ReportStatus } from "@/features/reports/data/sample-reports";

const styles: Record<ReportStatus, string> = {
  "Pending approval": "bg-amber-50 text-amber-800 ring-amber-200",
  Approved: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  Rejected: "bg-rose-50 text-rose-800 ring-rose-200",
  "Revision requested": "bg-sky-50 text-sky-800 ring-sky-200",
};

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  return <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ring-1 ${styles[status]}`}>{status}</span>;
}
