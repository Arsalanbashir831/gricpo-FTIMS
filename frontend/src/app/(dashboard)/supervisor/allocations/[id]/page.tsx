import { AllocationDetailScreen } from "@/features/allocations/components/allocation-detail-screen";

export default async function AllocationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AllocationDetailScreen id={id} />;
}
