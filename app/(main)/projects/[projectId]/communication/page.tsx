'use client'; // Behövs för state och interaktivitet

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProject } from '@/services/projectService';
import { Project } from '@/types';

import MessageFeed from '@/components/chat/MessageFeed';
import ChatInput from '@/components/chat/ChatInput';

interface ProjectCommunicationPageProps {
    params: {
        projectId: string;
    };
}

export default function ProjectCommunicationPage({ params }: ProjectCommunicationPageProps) {
    const { projectId } = params;
    const { data: session, status } = useSession();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [key, setKey] = useState(0); // Nyckel för att tvinga omladdning av meddelanden

    useEffect(() => {
        const fetchProjectData = async () => {
            if (status === 'authenticated' && session?.user?.id) {
                try {
                    const projectData = await getProject(projectId, session.user.id);
                    if (!projectData) {
                        notFound();
                    } else {
                        setProject(projectData);
                    }
                } catch (error) {
                    console.error("Fel vid hämtning av projekt", error);
                    notFound();
                }
            }
            if (status === 'unauthenticated') {
                notFound();
            }
            setLoading(false);
        };

        fetchProjectData();
    }, [projectId, session, status]);

    const handleMessageSent = useCallback(() => {
        console.log("Nytt meddelande skickat! Uppdaterar flödet...");
        setKey(prevKey => prevKey + 1); // Ändrar nyckeln för att trigga omladdning
    }, []);

    if (loading || !project) {
        return <p className="text-center text-gray-400 p-8">Laddar projektinformation...</p>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 h-full flex flex-col" style={{height: 'calc(100vh - 100px)'}}> 
            <div className="mb-6">
                <Link href={`/projects/${projectId}`} className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                    &larr; Tillbaka till projektet: {project.name}
                </Link>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mt-2">Projektdialog</h1>
                <p className="text-gray-400">Håll all konversation om projektet samlad på ett ställe.</p>
            </div>

            <div className="flex-grow flex flex-col bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
                <div className="flex-grow p-6 overflow-y-auto">
                    <MessageFeed projectId={projectId} key={key} />
                </div>
                <div className="p-4 bg-gray-900/60 border-t border-gray-700">
                    <ChatInput projectId={projectId} onMessageSent={handleMessageSent} />
                </div>
            </div>
        </div>
    );
}
