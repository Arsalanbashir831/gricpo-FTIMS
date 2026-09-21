import { MaintenanceEntryForm } from "@/features/maintenance/components/maintenance-entry-form";

export default async function EditServiceReportPage({ params }: { params: Promise<{ id: string }> }) {
  return <MaintenanceEntryForm kind="service" recordId={(await params).id} />;
}
