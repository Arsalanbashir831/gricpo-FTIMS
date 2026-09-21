import { EditTechnicianScreen } from "@/features/technicians/components/add-technician-screen";

export default async function EditTechnicianPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditTechnicianScreen id={id} />;
}
