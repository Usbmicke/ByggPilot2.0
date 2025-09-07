
'use client';
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/app/components/layout/Sidebar';
import Header from '@/app/components/layout/Header';
import Chat from '@/app/components/chat/Chat';

// Importera alla vyer
import DashboardView from '@/app/components/views/DashboardView';
import ProjectsView from '@/app/components/views/ProjectsView';
import DocumentsView from '@/app/components/views/DocumentsView';
import TimeReportingPage from '@/app/dashboard/time-reporting/page';
import CustomersPage from '@/app/dashboard/customers/page';
import SettingsView from '@/app/components/views/SettingsView';
import ProjectDetailView from '@/app/components/views/ProjectDetailView'; // 1. Importera nya vyn

export type View = 'DASHBOARD' | 'PROJECTS' | 'DOCUMENTS' | 'CUSTOMERS' | 'TIME_REPORTING' | 'SETTINGS';

// Typ för ett valt projekt
interface SelectedProject {
    id: string;
    name: string;
}

const AnimatedBackground = () => (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
    </div>
);

export default function DashboardPage() {
    const [activeView, setActiveView] = useState<View>('DASHBOARD');
    const [selectedProject, setSelectedProject] = useState<SelectedProject | null>(null); // 2. Nytt state
    const [isChatExpanded, setIsChatExpanded] = useState(false);
    const [startOnboardingFlow, setStartOnboardingFlow] = useState(false);
    const [startQuoteFlow, setStartQuoteFlow] = useState(false);
    const { data: session, status } = useSession();

    const handleNavClick = (view: View) => {
        setSelectedProject(null); // Återställ projektval vid navigering
        setActiveView(view);
    };
    
    const handleProjectClick = (project: SelectedProject) => {
        setSelectedProject(project);
    };

    const handleBackToDashboard = () => {
        setSelectedProject(null);
        setActiveView('DASHBOARD');
    };

    const handleStartOnboarding = () => { setStartOnboardingFlow(true); setIsChatExpanded(true); };
    const handleStartQuoteFlow = () => { setStartQuoteFlow(true); setIsChatExpanded(true); };
    const onOnboardingComplete = () => { setStartOnboardingFlow(false); };
    const onQuoteFlowComplete = () => { setStartQuoteFlow(false); };

    const renderView = () => {
        // 3. Uppdaterad render-logik
        if (selectedProject) {
            return <ProjectDetailView 
                        projectName={selectedProject.name} 
                        folderId={selectedProject.id} 
                        onBack={handleBackToDashboard}
                    />
        }

        switch (activeView) {
            case 'DASHBOARD':
                return <DashboardView 
                    session={session} 
                    status={status} 
                    onStartOnboarding={handleStartOnboarding} 
                    onStartQuoteFlow={handleStartQuoteFlow}
                    onProjectClick={handleProjectClick} // Skicka med click-handler
                />;
            case 'PROJECTS':
                // Pass project click handler to ProjectsView as well
                return <ProjectsView onProjectClick={handleProjectClick}/>;
            case 'CUSTOMERS':
                return <CustomersPage />;
            case 'TIME_REPORTING':
                return <TimeReportingPage />;
            case 'DOCUMENTS':
                return <DocumentsView />;
            case 'SETTINGS':
                return <SettingsView />;
            default:
                 return <DashboardView 
                    session={session} 
                    status={status} 
                    onStartOnboarding={handleStartOnboarding} 
                    onStartQuoteFlow={handleStartQuoteFlow}
                    onProjectClick={handleProjectClick}
                />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-gray-200 font-sans">
            <AnimatedBackground />
            <Sidebar 
                activeView={activeView}
                onNavClick={handleNavClick} 
                onStartQuoteFlow={handleStartQuoteFlow}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 relative">
                    {renderView()}
                </main>
                <Chat 
                    isExpanded={isChatExpanded} 
                    setExpanded={setIsChatExpanded}
                    startQuoteFlow={startQuoteFlow}
                    onQuoteFlowComplete={onQuoteFlowComplete}
                    startOnboardingFlow={startOnboardingFlow}
                    onOnboardingComplete={onOnboardingComplete}
                />
            </div>
        </div>
    );
};
