
import { auth } from '@/app/lib/auth';
import { getProject } from '@/app/services/projectService';
import { notFound } from 'next/navigation';
import ProjectHeader from '@/app/components/ProjectHeader';
import ViewTabs from '@/app/components/ViewTabs';
import DocumentView from '@/app/components/views/DocumentView';
import ChatView from '@/app/components/views/ChatView';
import InvoicingView from '@/app/components/views/InvoicingView';
import DashboardView from '@/app/components/views/DashboardView'; // Importera den nya vyn

interface ProjectPageProps {
    params: { projectId: string; };
    searchParams: { view?: string; };
}

// Definiera de tillgängliga vyerna
const views = {
    'dashboard': {
        name: 'Översikt',
        component: DashboardView,
    },
    'documents': {
        name: 'Dokument',
        component: DocumentView,
    },
    'invoicing': {
        name: 'Fakturering',
        component: InvoicingView,
    },
    'chat': {
        name: 'Chatt',
        component: ChatView,
    },
};

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) { notFound(); }

    const project = await getProject(params.projectId, userId);
    if (!project) { notFound(); }

    // Bestäm vilken vy som ska visas. Fallback till 'dashboard'.
    const currentViewKey = searchParams.view && Object.keys(views).includes(searchParams.view) 
        ? searchParams.view 
        : 'dashboard';
        
    const ActiveView = views[currentViewKey as keyof typeof views].component;

    return (
        <div className="h-full flex flex-col">
            <ProjectHeader project={project} />
            <div className="flex-grow overflow-y-auto bg-gray-900">
                <ViewTabs views={views} currentViewKey={currentViewKey} projectId={project.id} />
                <ActiveView project={project} />
            </div>
        </div>
    );
}
