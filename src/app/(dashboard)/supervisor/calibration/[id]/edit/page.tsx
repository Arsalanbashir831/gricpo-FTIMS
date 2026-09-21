import { EditCalibrationScreen } from "@/features/calibration/components/edit-calibration-screen";
export default async function EditCalibrationPage({ params }: { params: Promise<{ id: string }> }) {
  return <EditCalibrationScreen id={(await params).id} />;
}
