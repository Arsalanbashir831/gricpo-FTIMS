import { TechnicianProfileScreen } from "@/features/technicians/components/technician-profile-screen";

export default async function EditTechnicianPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const technicianId = Number(id);
  if (!Number.isInteger(technicianId) || technicianId < 1) return <p className="p-6 text-sm text-rose-700">Invalid technician.</p>;
  return <TechnicianProfileScreen technicianId={technicianId} />;
}
