import { EditProjectScreen } from "@/features/projects/components/edit-project-screen";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <EditProjectScreen projectId={resolvedParams.id} />;
}
