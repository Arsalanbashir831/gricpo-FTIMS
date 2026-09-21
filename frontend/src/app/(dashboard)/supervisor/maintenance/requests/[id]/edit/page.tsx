import { MaintenanceEntryForm } from "@/features/maintenance/components/maintenance-entry-form";

export default async function EditMaintenanceRequestPage({ params }: { params: Promise<{ id: string }> }) {
  return <MaintenanceEntryForm kind="request" recordId={(await params).id} />;
}
