import { EditEquipmentScreen } from "@/features/equipment/components/edit-equipment-screen";

export default async function EditEquipmentPage({ params }: { params: Promise<{ id: string }> }) {
  return <EditEquipmentScreen id={(await params).id} />;
}
