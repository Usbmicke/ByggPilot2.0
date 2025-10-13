import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { getProject } from '@/services/projectService';
import { notFound } from 'next/navigation';
import { updateProjectAction, archiveProjectAction } from './actions';
import { ProjectStatus } from '@/types/index';

interface EditProjectPageProps {
  params: {
    projectId: string;
  };
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { projectId } = params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return <p>Autentisering krävs.</p>;
  }

  const project = await getProject(projectId, userId);

  if (!project) {
    notFound();
  }
  
  // Säkerställ att deadline är i rätt format (YYYY-MM-DD) för input-fältet
  const deadlineForInput = project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '';

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Redigera Projekt</h1>
      
      <form action={updateProjectAction} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
        <input type="hidden" name="projectId" value={project.id} />

        {/* Projektnamn */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Projektnamn</label>
          <input id="name" name="name" type="text" defaultValue={project.name} required
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        </div>

        {/* Adress */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Adress</label>
          <input id="address" name="address" type="text" defaultValue={project.address || ''}
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        </div>

        {/* Status */}
        <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select id="status" name="status" defaultValue={project.status}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md">
                {Object.values(ProjectStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                ))}
            </select>
        </div>

        {/* Förlopp */}
        <div>
             <label htmlFor="progress" className="block text-sm font-medium text-gray-700">Förlopp ({project.progress ?? 0}%)</label>
             <input id="progress" name="progress" type="range" min="0" max="100" defaultValue={project.progress ?? 0}
                    className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
        </div>

        {/* Deadline */}
        <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">Tidsfrist</label>
            <input id="deadline" name="deadline" type="date" defaultValue={deadlineForInput}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        </div>
        
        <div className="flex justify-between items-center pt-4">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
            Spara Ändringar
          </button>
        </div>
      </form>

       {/* Arkivera-knapp i ett eget formulär */}
       <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900">Fler alternativ</h3>
          <p className="mt-1 text-sm text-gray-600">Att arkivera ett projekt flyttar det från dina aktiva listor till arkivet.</p>
           <form action={archiveProjectAction} className="mt-4">
                <input type="hidden" name="projectId" value={project.id} />
                 <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md">
                    Arkivera Projekt
                </button>
           </form>
       </div>
    </div>
  );
}
