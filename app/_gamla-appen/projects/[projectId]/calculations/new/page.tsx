
import CalculationEngine from '@/app/components/dashboard/CalculationEngine';
import { getProject } from '@/app/services/projectService';
import { auth } from '@/app/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface NewCalculationPageProps {
    params: {
        projectId: string;
    };
}

/**
 * Sida för att skapa en ny kalkyl för ett specifikt projekt.
 */
export default async function NewCalculationPage({ params }: NewCalculationPageProps) {
    const { projectId } = params;
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        // Fallback för säkerhet, bör hanteras av middleware
        return <p className="text-center text-red-400 p-8">Åtkomst nekad. Du måste vara inloggad.</p>;
    }

    // Verifiera att projektet existerar och tillhör användaren
    const project = await getProject(projectId, userId);

    if (!project) {
        notFound(); // Visar en 404-sida om projektet inte finns eller inte ägs av användaren
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            {/* Sidhuvud med kontext */}
            <div className="mb-8">
                <Link href={`/projects/${projectId}`} className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                    &larr; Tillbaka till projektet: {project.name}
                </Link>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mt-2">Ny Kalkyl</h1>
                <p className="text-gray-400">Skapa en detaljerad offert för ditt projekt.</p>
            </div>

            {/* Rendera kalkylmotorn med projekt-ID */}
            <CalculationEngine projectId={projectId} />
        </div>
    );
}
