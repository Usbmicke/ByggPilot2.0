import { getServerSession } from '@/app/lib/auth';
import { listProjects } from '@/app/services/projectService';
import { Project } from '@/app/types';
import Link from 'next/link';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('sv-SE', { day: '2-digit', month: 'short', year: 'numeric' });
}

const ProjectRow = ({ project }: { project: Project }) => {
    const progress = project.progress ?? 0;

    return (
        <Link href={`/projects/${project.id}`} passHref>
            <div className="block bg-white hover:bg-gray-50 transition-colors duration-150 p-4 rounded-lg shadow-sm cursor-pointer">
                <div className="flex flex-col sm:flex-row justify-between">
                    <div className="mb-2 sm:mb-0">
                        <h3 className="font-bold text-lg text-gray-800">{project.name}</h3>
                        <p className="text-sm text-gray-600">{project.customerName}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                         <div className="hidden md:block">
                             <p className="text-sm text-gray-500">Senast aktivitet</p>
                             <p className="font-medium text-gray-700">{formatDate(project.lastActivity)}</p>
                         </div>
                        <span className="text-sm font-semibold py-1 px-3 rounded-full bg-blue-100 text-blue-800">{project.status}</span>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>
        </Link>
    );
};


export default async function ProjectsPage() {
  const session = await getServerSession();
  const userId = session?.user?.id;

  if (!userId) {
    return <p>Du måste vara inloggad för att se projekt.</p>;
  }

  const projects = await listProjects(userId);

  return (
    <div className="space-y-8">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Dina Projekt</h1>
            <Link href="/projects/new" passHref>
                 <span className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md cursor-pointer">
                    Skapa Nytt Projekt
                </span>
            </Link>
        </div>

        {projects.length > 0 ? (
            <div className="space-y-4">
                {projects.map(project => (
                    <ProjectRow key={project.id} project={project} />
                ))}
            </div>
        ) : (
            <div className="text-center py-12 px-4 bg-white rounded-lg shadow-sm">
                <h2 className="text-xl font-medium text-gray-800">Inga aktiva projekt</h2>
                <p className="text-gray-500 mt-2">Klicka på "Skapa Nytt Projekt" för att komma igång.</p>
            </div>
        )}
    </div>
  );
}
