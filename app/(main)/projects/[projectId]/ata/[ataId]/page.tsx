
import { authOptions } from '@/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { notFound } from 'next/navigation';
import { getProject } from '@/services/projectService';
import { getAta } from '@/services/ataService'; // Ny service-funktion som behöver skapas
import ProjectDashboard from '@/components/dashboard/ProjectDashboard'; // Korrigerad import
import AtaDetailView from '@/components/views/AtaDetailView'; // Ny vy-komponent som behöver skapas

interface AtaDetailPageProps {
    params: { 
        projectId: string; 
        ataId: string;
    };
}

// Detta är en Server Component som ansvarar för att hämta data
export default async function AtaDetailPage({ params }: AtaDetailPageProps) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) { notFound(); }

    // Hämta både projekt- och ÄTA-data parallellt för effektivitet
    const [project, ata] = await Promise.all([
        getProject(params.projectId, userId),
        getAta(params.ataId) // Antagande: getAta behöver bara ataId för att vara unik
    ]);

    // Om projektet eller ÄTA:n inte finns, eller om ÄTA:n inte tillhör projektet, visa 404
    if (!project || !ata || ata.projectId !== project.id) {
        notFound();
    }

    return (
        <div className="h-full flex flex-col">
            {/* Återanvänd samma header för en konsekvent känsla */}
            <ProjectDashboard project={project} />
            <div className="flex-grow overflow-y-auto bg-gray-900">
               {/* Här renderas den nya klientkomponenten med all data den behöver */}
               <AtaDetailView project={project} initialAta={ata} />
            </div>
        </div>
    );
}
