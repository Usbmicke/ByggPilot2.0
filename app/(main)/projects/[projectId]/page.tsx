
import { getServerSession } from 'next-auth/next';
import { notFound } from 'next/navigation';
import { authOptions } from '@/lib/authOptions';
import { getProject, getInvoicesForProject, getAtasForProject, getDocumentsForProject } from '@/actions/projectActions';
import ProjectDetailView from '@/components/views/ProjectDetailView';

interface ProjectDetailPageProps {
  params: {
    projectId: string;
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { projectId } = params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    notFound();
  }

  const [projectResult, invoicesResult, atasResult, documentsResult] = await Promise.all([
    getProject(projectId, userId),
    getInvoicesForProject(projectId, userId),
    getAtasForProject(projectId, userId),
    getDocumentsForProject(projectId, userId),
  ]);

  if (!projectResult.success || !projectResult.data) {
    notFound();
  }

  return (
    <ProjectDetailView
      project={projectResult.data}
      initialInvoices={invoicesResult.success ? invoicesResult.data : []}
      initialAtas={atasResult.success ? atasResult.data : []}
      initialDocuments={documentsResult.success ? documentsResult.data : []}
    />
  );
}
