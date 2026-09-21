import { CalibrationDetailScreen } from "@/features/calibration/components/calibration-detail-screen";
export default async function CalibrationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <CalibrationDetailScreen id={(await params).id} />;
}
