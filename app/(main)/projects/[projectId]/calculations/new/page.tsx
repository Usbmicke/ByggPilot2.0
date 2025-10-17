
import CalculationEngine from '@/components/dashboard/CalculationEngine';
import { getProject } from '@/actions/projectActions';
import { getServerSession } from 'next-auth/next';
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
    const session = await getServerSession();
    const userId = session?.user?.id;

    if (!userId) {
        return <p className="text-center text-red-400 p-8">Åtkomst nekad. Du måste vara inloggad.</p>;
    }

    const projectResult = await getProject(projectId, userId);

    if (!projectResult.success || !projectResult.data) {
        notFound();
    }
    const project = projectResult.data;

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <div className="mb-8">
                <Link href={`/projects/${projectId}`} className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                    &larr; Tillbaka till projektet: {project.name}
                </Link>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mt-2">Ny Kalkyl</h1>
                <p className="text-gray-400">Skapa en detaljerad offert för ditt projekt.</p>
            </div>

            <CalculationEngine projectId={projectId} />
        </div>
    );
}
