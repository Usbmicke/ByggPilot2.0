
import { auth } from '@/app/lib/auth';
import { getProject } from '@/app/services/projectService';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ProjectStatus } from '@/app/types';
import { PencilIcon, DocumentChartBarIcon, ChatBubbleLeftRightIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

interface ProjectDetailPageProps {
  params: {
    projectId: string;
  };
}

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' });

const getStatusChipClass = (status: ProjectStatus) => {
  switch (status) {
    case ProjectStatus.Completed:
      return 'bg-green-500/20 text-green-300';
    case ProjectStatus.InProgress:
      return 'bg-cyan-500/20 text-cyan-300';
    case ProjectStatus.OnHold:
      return 'bg-yellow-500/20 text-yellow-300';
    default:
      return 'bg-gray-500/20 text-gray-300';
  }
};

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { projectId } = params;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return <p className="text-center text-red-400 p-8">Autentisering krävs.</p>;
  }

  const project = await getProject(projectId, userId);

  if (!project) {
    notFound(); 
  }

  const progress = project.progress ?? 0;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <Link href="/projects" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">&larr; Tillbaka till alla projekt</Link>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mt-1">{project.name}</h1>
          <p className="text-gray-400 mt-1">{project.customerName}</p>
        </div>
        <Link href={`/projects/${projectId}/edit`} passHref>
          <span className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 cursor-pointer transition-colors">
            <PencilIcon className="w-5 h-5" />
            Redigera
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700">
            <h3 className="text-base font-medium text-gray-400">Status</h3>
            <p className={`mt-2 inline-block px-3 py-1 text-sm font-semibold rounded-full ${getStatusChipClass(project.status)}`}>
              {project.status}
            </p>
          </div>
          <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700">
            <h3 className="text-base font-medium text-gray-400">Förlopp</h3>
            <div className="mt-2 flex items-center gap-3">
               <div className="w-full bg-gray-700 rounded-full h-2.5">
                 <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
               </div>
               <span className="font-medium text-white">{progress}%</span>
            </div>
          </div>
           <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700">
            <h3 className="text-base font-medium text-gray-400">Skapades</h3>
            <p className="mt-2 text-lg font-semibold text-white">{formatDate(project.createdAt)}</p>
          </div>
      </div>
      
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Projektinnehåll</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <Link href={`/projects/${projectId}/calculations/new`} passHref>
              <div className="bg-gray-700/50 hover:bg-gray-600 p-5 rounded-xl transition-colors cursor-pointer flex items-center gap-4 border border-gray-700 hover:border-cyan-500">
                  <DocumentChartBarIcon className="w-10 h-10 text-cyan-400" />
                  <div>
                    <h3 className="font-bold text-lg text-white">Kalkyler & Offerter</h3>
                    <p className="text-sm text-gray-400">Skapa och hantera offerter</p>
                  </div>
              </div>
            </Link>

            <Link href={`/projects/${projectId}/documents`} passHref>
              <div className="bg-gray-700/50 hover:bg-gray-600 p-5 rounded-xl transition-colors cursor-pointer flex items-center gap-4 border border-gray-700 hover:border-cyan-500">
                  <DocumentDuplicateIcon className="w-10 h-10 text-cyan-400" />
                  <div>
                    <h3 className="font-bold text-lg text-white">Dokument</h3>
                    <p className="text-sm text-gray-400">Ladda upp och visa filer</p>
                  </div>
              </div>
            </Link>

             <Link href={`/projects/${projectId}/communication`} passHref>
              <div className="bg-gray-700/50 hover:bg-gray-600 p-5 rounded-xl transition-colors cursor-pointer flex items-center gap-4 border border-gray-700 hover:border-cyan-500">
                <ChatBubbleLeftRightIcon className="w-10 h-10 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-lg text-white">Kommunikation</h3>
                  <p className="text-sm text-gray-400">Visa och skicka meddelanden</p>
                </div>
              </div>
            </Link>

          </div>
      </div>

    </div>
  );
}
