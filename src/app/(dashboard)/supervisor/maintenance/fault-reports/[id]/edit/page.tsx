import { MaintenanceEntryForm } from "@/features/maintenance/components/maintenance-entry-form";

export default async function EditFaultReportPage({ params }: { params: Promise<{ id: string }> }) {
  return <MaintenanceEntryForm kind="fault" recordId={(await params).id} />;
}
