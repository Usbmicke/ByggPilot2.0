
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/authOptions';
import { getProjectStats, getActiveProjects } from '@/lib/dal/projects'; // PLATSHÅLLARE: DAL-funktioner
import { StatCard } from '@/components/dashboard/StatCard';
import { ProjectCard } from '@/components/dashboard/ProjectCard'; // PLATSHÅLLARE: Komponent för projektkort
import { CreateNewButton } from '@/components/dashboard/CreateNewButton'; // PLATSHÅLLARE: Knapp för "Skapa Nytt"

// FAS 1: Huvudsidan byggs som en ren async Server Component
export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect('/');
    }

    if (!session.user.onboardingComplete) {
        redirect('/onboarding');
    }

    // FAS 1: Datahämtning via DAL direkt i Server Component
    const projectStats = await getProjectStats(session.user.id);
    const activeProjects = await getActiveProjects(session.user.id);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-text-primary">Välkommen tillbaka, {session.user.name?.split(' ')[0] || '!'}</h1>
            </div>

            {/* Statistikkort */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Totalt antal projekt" value={projectStats.total} />
                <StatCard title="Pågående projekt" value={projectStats.ongoing} main />
                <StatCard title="Totala intäkter" value={`${projectStats.revenue.toLocaleString('sv-SE')} kr`} />
            </div>

            {/* Pågående Projekt Sektion */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-text-primary">Pågående Projekt</h2>
                    <CreateNewButton />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {activeProjects.map(project => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            </div>
        </div>
    );
}
