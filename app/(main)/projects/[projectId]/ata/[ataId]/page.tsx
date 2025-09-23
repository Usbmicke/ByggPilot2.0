
import { auth } from '@/app/lib/auth';
import { notFound } from 'next/navigation';
import { getProject } from '@/app/services/projectService';
import { getAta } from '@/app/services/ataService'; // Ny service-funktion som behöver skapas
import ProjectHeader from '@/app/components/ProjectHeader';
import AtaDetailView from '@/app/components/views/AtaDetailView'; // Ny vy-komponent som behöver skapas

interface AtaDetailPageProps {
    params: { 
        projectId: string; 
        ataId: string;
    };
}

// Detta är en Server Component som ansvarar för att hämta data
export default async function AtaDetailPage({ params }: AtaDetailPageProps) {
    const session = await auth();
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
            <ProjectHeader project={project} />
            <div className="flex-grow overflow-y-auto bg-gray-900">
               {/* Här renderas den nya klientkomponenten med all data den behöver */}
               <AtaDetailView project={project} initialAta={ata} />
            </div>
        </div>
    );
}
