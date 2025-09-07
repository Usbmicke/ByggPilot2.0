
'use client';
import React, { useState } from 'react';
import { useSession } from 'next-auth/react'; // 1. Importera useSession
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

export type View = 'DASHBOARD' | 'PROJECTS' | 'DOCUMENTS' | 'CUSTOMERS' | 'TIME_REPORTING' | 'SETTINGS';

const AnimatedBackground = () => (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
    </div>
);

export default function DashboardPage() {
    const [activeView, setActiveView] = useState<View>('DASHBOARD');
    const [isChatExpanded, setIsChatExpanded] = useState(false);
    const [startOnboardingFlow, setStartOnboardingFlow] = useState(false); // 2. Skapa nytt state
    const { data: session, status } = useSession(); // Hämta session-status

    const handleNavClick = (view: View) => {
        setActiveView(view);
    };

    // 3. Skapa handler-funktion
    const handleStartOnboarding = () => {
        setStartOnboardingFlow(true);
        setIsChatExpanded(true); // Öppna chatten automatiskt
    };

    // Funktion för att återställa flödet när det är klart
    const onOnboardingComplete = () => {
        setStartOnboardingFlow(false);
    };

    const renderView = () => {
        switch (activeView) {
            case 'DASHBOARD':
                // Skicka med session-data och handler till vyn
                return <DashboardView session={session} status={status} onStartOnboarding={handleStartOnboarding} />;
            case 'PROJECTS':
                return <ProjectsView />;
            case 'CUSTOMERS':
                return <CustomersPage />;
            case 'TIME_REPORTING':
                return <TimeReportingPage />;
            case 'DOCUMENTS':
                return <DocumentsView />;
            case 'SETTINGS':
                return <SettingsView />;
            default:
                 return <DashboardView session={session} status={status} onStartOnboarding={handleStartOnboarding} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-gray-200 font-sans">
            <AnimatedBackground />
            <Sidebar 
                activeView={activeView}
                onNavClick={handleNavClick} 
                onStartQuoteFlow={() => setIsChatExpanded(true)}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 relative">
                    {renderView()}
                </main>
                <Chat 
                    isExpanded={isChatExpanded} 
                    setExpanded={setIsChatExpanded}
                    startQuoteFlow={false} // Behölls för bakåtkompatibilitet, men används inte för detta flöde
                    onQuoteFlowComplete={() => {}} // Samma som ovan
                    startOnboardingFlow={startOnboardingFlow} // 4. Skicka med det nya state-värdet
                    onOnboardingComplete={onOnboardingComplete} // Skicka med callback
                />
            </div>
        </div>
    );
};
