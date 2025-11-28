'use client';

import { useAuth } from '@/lib/auth/AuthProvider';
import { useGenkit } from '@/lib/hooks/useGenkit';
import { getUserProfile } from '@/genkit/flows/getUserProfile';
import { listProjects } from '@/genkit/flows/listProjects'; // Antagande att denna flow finns
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Komponent för att visa när inga projekt finns (Zero State)
const ZeroState = () => (
    <div className='text-center'>
        <h2 className='text-2xl font-semibold'>Välkommen till Bygg-Pilot!</h2>
        <p className='mt-2 text-gray-500'>Det ser ut som att du inte har några projekt ännu.</p>
        <button 
            className='mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
            // onClick={() => createNewProject()} // TODO: Länka till flöde för att skapa projekt
        >
            Skapa ditt första projekt
        </button>
    </div>
);

// Komponent för att visa ett enskilt projektkort
const ProjectCard = ({ project }: { project: any }) => (
    <div className='p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow'>
        <h3 className='font-bold'>{project.name}</h3>
        <p className='text-sm text-gray-600'>{project.description}</p>
        {/* Fler detaljer kan läggas till här */}
    </div>
);


export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    // Hook för att hämta användarprofil
    const { data: userProfile, loading: profileLoading } = useGenkit(getUserProfile, undefined, { enabled: !!user });

    // Hook för att hämta projekt
    const { data: projects, loading: projectsLoading, error: projectsError } = useGenkit(listProjects, undefined, { enabled: !!userProfile });

    useEffect(() => {
        // Om autentisering inte laddar och ingen användare finns, skicka till login
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    // Global laddningsstatus
    const isLoading = authLoading || profileLoading || projectsLoading;

    // Visa laddningsindikator
    if (isLoading) {
        return <div className='flex justify-center items-center h-screen'><p>Laddar...</p></div>;
    }

    // Visa felmeddelande om projekt inte kunde hämtas
    if (projectsError) {
        return <div className='text-red-500 text-center'><p>Kunde inte ladda projekt: {projectsError.message}</p></div>;
    }

    return (
        <main className='p-8'>
            <h1 className='text-3xl font-bold mb-6'>Dina Projekt</h1>
            {
                projects && projects.length > 0 
                ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {projects.map(p => <ProjectCard key={p.id} project={p} />)}
                    </div>
                ) 
                : <ZeroState />
            }
        </main>
    );
}
