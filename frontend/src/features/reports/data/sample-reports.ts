export type ReportStatus = "Pending approval" | "Approved" | "Rejected" | "Revision requested";
export type ReportAttachment = { name: string; size: string; type: "PDF" | "XLSX" | "ZIP" };
export type ReportRecord = {
  id: string;
  technician: string;
  project: string;
  method: string;
  equipment: string;
  uploadedAt: string;
  status: ReportStatus;
  remarks: string;
  attachments: ReportAttachment[];
  verificationCode: string;
};

const standardAttachments: ReportAttachment[] = [
  { name: "Field_Test_Report.pdf", size: "2.4 MB", type: "PDF" },
  { name: "Test_Results.xlsx", size: "1.1 MB", type: "XLSX" },
  { name: "Site_Photos.zip", size: "5.7 MB", type: "ZIP" },
];

export const sampleReports: ReportRecord[] = [
  { id: "REP-2026-001", technician: "Imran Ali", project: "SPARK – Ras Tanura", method: "PMI / XRF", equipment: "X-MET8000 (GRIP-PMI-007)", uploadedAt: "2026-09-12T10:24:00", status: "Pending approval", remarks: "PMI testing completed for piping materials at Ras Tanura site. All results within acceptable limits.", attachments: standardAttachments, verificationCode: "GRP-2026-001-A7F3" },
  { id: "REP-2026-002", technician: "Salman Khan", project: "Jafurah", method: "UT / NDT", equipment: "USM 36 (GRIP-UT-011)", uploadedAt: "2026-09-11T16:20:00", status: "Pending approval", remarks: "Ultrasonic testing completed for the inspected welds.", attachments: standardAttachments.slice(0, 2), verificationCode: "GRP-2026-002-B4K8" },
  { id: "REP-2026-003", technician: "Danish Iqbal", project: "Yanbu", method: "PWHT", equipment: "Chino Recorder (GRIP-PWHT-002)", uploadedAt: "2026-09-11T09:15:00", status: "Approved", remarks: "Heat treatment cycle completed and recorded.", attachments: standardAttachments.slice(0, 2), verificationCode: "GRP-2026-003-C2P5" },
  { id: "REP-2026-004", technician: "Waqas Ahmad", project: "SPARK Abqaiq", method: "Hardness", equipment: "Equotip 550 (GRIP-HDT-004)", uploadedAt: "2026-09-10T14:45:00", status: "Pending approval", remarks: "Hardness readings recorded at the assigned inspection points.", attachments: standardAttachments.slice(0, 1), verificationCode: "GRP-2026-004-D9M1" },
  { id: "REP-2026-005", technician: "Faisal Khan", project: "Ras Tanura", method: "Metallography", equipment: "Metallography kit", uploadedAt: "2026-09-10T11:30:00", status: "Pending approval", remarks: "Replica preparation and microstructure observations attached.", attachments: standardAttachments, verificationCode: "GRP-2026-005-E3R6" },
  { id: "REP-2026-006", technician: "Nadeem Raza", project: "Shaybah", method: "UT / NDT", equipment: "UT machine", uploadedAt: "2026-09-09T13:10:00", status: "Approved", remarks: "Thickness measurements completed.", attachments: standardAttachments.slice(0, 2), verificationCode: "GRP-2026-006-F8T2" },
  { id: "REP-2026-007", technician: "Ali Rashid", project: "Jafurah", method: "PMI / XRF", equipment: "X-MET8000", uploadedAt: "2026-09-09T08:50:00", status: "Rejected", remarks: "Initial material identification report submitted for review.", attachments: standardAttachments.slice(0, 1), verificationCode: "GRP-2026-007-G5N4" },
  { id: "REP-2026-008", technician: "Ahmed Khan", project: "Yanbu", method: "Visual inspection", equipment: "Inspection kit", uploadedAt: "2026-09-08T15:40:00", status: "Pending approval", remarks: "Visual inspection findings and site photos attached.", attachments: standardAttachments.slice(0, 1), verificationCode: "GRP-2026-008-H1S9" },
  { id: "REP-2026-009", technician: "Bilal Hussain", project: "Ras Tanura", method: "UT / NDT", equipment: "UT machine", uploadedAt: "2026-09-08T12:05:00", status: "Approved", remarks: "Weld inspection results submitted.", attachments: standardAttachments.slice(0, 2), verificationCode: "GRP-2026-009-J6V2" },
  { id: "REP-2026-010", technician: "Irfan Sheikh", project: "SPARK Abqaiq", method: "Other", equipment: "Field testing kit", uploadedAt: "2026-09-07T10:00:00", status: "Revision requested", remarks: "Additional calibration evidence required.", attachments: standardAttachments.slice(0, 1), verificationCode: "GRP-2026-010-K2W7" },
];

export function formatReportDate(value: string, withTime = false) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit", hour12: false } : {}),
    timeZone: "UTC",
  }).format(new Date(value.endsWith("Z") ? value : `${value}Z`));
}
