import { AddAllocationScreen } from "@/features/allocations/components/add-allocation-screen";

export default async function EditAllocationPage({ params }: { params: Promise<{ id: string }> }) {
  return <AddAllocationScreen recordId={(await params).id} />;
}
