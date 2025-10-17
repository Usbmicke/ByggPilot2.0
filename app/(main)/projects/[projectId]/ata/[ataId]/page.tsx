
import { getServerSession } from 'next-auth/next';
import { notFound } from 'next/navigation';
import { getProject, getAta } from '@/actions/projectActions';
import ProjectDashboard from '@/components/dashboard/ProjectDashboard';
import AtaDetailView from '@/components/views/AtaDetailView';

interface AtaDetailPageProps {
    params: { 
        projectId: string; 
        ataId: string;
    };
}

// Detta är en Server Component som ansvarar för att hämta data
export default async function AtaDetailPage({ params }: AtaDetailPageProps) {
    const session = await getServerSession();
    const userId = session?.user?.id;

    if (!userId) { notFound(); }

    // Hämta både projekt- och ÄTA-data parallellt för effektivitet
    const [projectResult, ataResult] = await Promise.all([
        getProject(params.projectId, userId),
        getAta(params.projectId, params.ataId, userId) 
    ]);

    // Om projektet eller ÄTA:n inte finns, eller om ÄTA:n inte tillhör projektet, visa 404
    if (!projectResult.success || !ataResult.success || !projectResult.data || !ataResult.data) {
        notFound();
    }

    return (
        <div className="h-full flex flex-col">
            <ProjectDashboard project={projectResult.data} />
            <div className="flex-grow overflow-y-auto bg-gray-900">
               <AtaDetailView project={projectResult.data} initialAta={ataResult.data} />
            </div>
        </div>
    );
}
