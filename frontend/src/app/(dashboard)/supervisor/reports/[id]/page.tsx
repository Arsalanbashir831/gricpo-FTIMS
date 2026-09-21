import { ReportDetailScreen } from "@/features/reports/components/report-detail-screen";

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReportDetailScreen id={id} />;
}
