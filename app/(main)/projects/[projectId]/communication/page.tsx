
import { getServerSession } from 'next-auth/next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProject } from '@/actions/projectActions';
import { logger } from '@/lib/logger';
import MessageFeed from '@/components/chat/MessageFeed';
import ChatWindow from '@/components/chat/ChatWindow';

interface ProjectCommunicationPageProps {
    params: {
        projectId: string;
    };
}

export default async function ProjectCommunicationPage({ params }: ProjectCommunicationPageProps) {
    const { projectId } = params;
    const session = await getServerSession();

    if (!session?.user?.id) {
        notFound();
    }

    const { data: project, error } = await getProject(projectId, session.user.id);

    if (error || !project) {
        logger.error({ error, projectId }, "Fel vid hämtning av projekt");
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 h-full flex flex-col" style={{height: 'calc(100vh - 100px)'}}> 
            <div className="mb-6">
                <Link href={`/projects/${projectId}`} className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                    &larr; Tillbaka till projektet: {project.projectName}
                </Link>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mt-2">Projektdialog</h1>
                <p className="text-gray-400">Håll all konversation om projektet samlad på ett ställe.</p>
            </div>

            <div className="flex-grow flex flex-col bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
                <ChatWindow />
            </div>
        </div>
    );
}
