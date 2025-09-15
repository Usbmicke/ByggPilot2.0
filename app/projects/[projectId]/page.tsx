import { getServerSession } from '@/app/lib/auth';
import { getProject } from '@/app/services/projectService';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ProjectStatus } from '@/app/types';

interface ProjectDetailPageProps {
  params: {
    projectId: string;
  };
}

// Helper för att formatera datum
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' });

// Helper för att få färg baserat på status
const getStatusChipClass = (status: ProjectStatus) => {
  switch (status) {
    case ProjectStatus.Completed:
      return 'bg-green-100 text-green-800';
    case ProjectStatus.InProgress:
      return 'bg-blue-100 text-blue-800';
    case ProjectStatus.OnHold:
      return 'bg-yellow-100 text-yellow-800';
    case ProjectStatus.NotStarted:
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { projectId } = params;
  const session = await getServerSession();
  const userId = session?.user?.id;

  if (!userId) {
    return <p>Autentisering krävs.</p>;
  }

  const project = await getProject(projectId, userId);

  if (!project) {
    notFound(); // getProject returnerar null om projektet är arkiverat eller inte finns
  }

  const progress = project.progress ?? 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* -- Rubrik och knappar -- */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-sm text-gray-500">Projekt</p>
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
        </div>
        <Link href={`/projects/${projectId}/edit`} passHref>
          <span className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md cursor-pointer">
            Redigera projekt
          </span>
        </Link>
      </div>

      {/* -- Detaljkort -- */}
      <div className="bg-white shadow-md rounded-lg p-6 space-y-6">

        {/* Status och Förlopp */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className={`mt-1 inline-block px-3 py-1 text-sm font-semibold rounded-full ${getStatusChipClass(project.status)}`}>
              {project.status}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Förlopp</h3>
            <div className="mt-2 flex items-center gap-2">
               <div className="w-full bg-gray-200 rounded-full h-2.5">
                 <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
               </div>
               <span className="font-medium text-gray-700">{progress}%</span>
            </div>
          </div>
        </div>

        {/* Kund och Adress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Kund</h3>
            <p className="mt-1 text-gray-900 font-semibold">{project.customerName}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Adress</h3>
            <p className="mt-1 text-gray-900">{project.address || 'Ingen adress angiven'}</p>
          </div>
        </div>

         {/* Datum */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Skapat</h3>
            <p className="mt-1 text-gray-900">{formatDate(project.createdAt)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Senaste aktivitet</h3>
            <p className="mt-1 text-gray-900">{formatDate(project.lastActivity)}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
