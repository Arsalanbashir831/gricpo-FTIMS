import { EquipmentDetailScreen } from "@/features/equipment/components/equipment-detail-screen";

export default async function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EquipmentDetailScreen id={id} />;
}
