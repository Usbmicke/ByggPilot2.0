
import { getProject } from '@/actions/projectActions';
import { authOptions } from '@/lib/authOptions';
import { getServerSession } from 'next-auth/next';
import { notFound } from 'next/navigation';
import InvoicingView from '@/components/views/InvoicingView';

interface ProjectInvoicingPageProps {
  params: {
    projectId: string;
  };
}

/**
 * Sidan för all fakturahantering kopplad till ett specifikt projekt.
 */
export default async function ProjectInvoicingPage({ params }: ProjectInvoicingPageProps) {
  const { projectId } = params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    // Detta bör hanteras av middleware i en riktig app, men som en extra säkerhet.
    notFound();
  }

  const { data: project, error } = await getProject(projectId, userId);

  if (error || !project) {
    // Om projektet inte finns eller om användaren inte äger det, visa 404.
    notFound();
  }

  return (
    <div>
      {/* Vi skickar med projekt-datan till vyn så den har all kontext den behöver */}
      <InvoicingView project={project} />
    </div>
  );
}
