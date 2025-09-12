
'use client';

import React, { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

import Sidebar from '@/app/components/layout/Sidebar';
import Header from '@/app/components/layout/Header';
import Chat from '@/app/components/chat/Chat';
import DashboardView from '@/app/components/views/DashboardView';
import ProjectsView from '@/app/components/views/ProjectsView';
import CustomersView from '@/app/components/views/CustomersView';
import DocumentsView from '@/app/components/views/DocumentsView';
import SettingsView from '@/app/components/views/SettingsView';
import NewProjectModal from '@/app/components/NewProjectModal';
import { Project } from '@/app/types';

export type View = "DASHBOARD" | "PROJECTS" | "TIME_REPORTING" | "DOCUMENTS" | "CUSTOMERS" | "SETTINGS";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  
  const [activeView, setActiveView] = useState<View>('DASHBOARD');
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // States för att styra chatten
  const [isChatExpanded, setIsChatExpanded] = useState(true); // Starta expanderad för synlighet
  const [startChatQuoteFlow, setStartChatQuoteFlow] = useState(false);
  const [startChatOnboarding, setStartChatOnboarding] = useState(false);

  // Funktioner som kan anropas från olika delar av appen för att starta flöden i chatten
  const handleStartOnboarding = () => {
    setIsChatExpanded(true);
    setStartChatOnboarding(true);
  };
  
  const handleStartQuoteFlow = () => {
    setIsChatExpanded(true); // Se till att chatten är öppen
    setStartChatQuoteFlow(true); // Starta offertflödet i chatten
  };

  const handleProjectClick = (project: Project) => {
    console.log(`Navigerar till projekt: ${project.name}`);
    // Framtida logik för att byta till en projektdetaljvy
  };

  const CurrentView = useMemo(() => {
    const viewProps = {
        session: session,
        status: status,
        onStartOnboarding: handleStartOnboarding,
        onStartQuoteFlow: handleStartQuoteFlow, // Använd chat-flödet
        onProjectClick: handleProjectClick,
    };

    switch (activeView) {
      case 'DASHBOARD': return <DashboardView {...viewProps} />;
      case 'PROJECTS': return <ProjectsView />;
      case 'CUSTOMERS': return <CustomersView />;
      case 'DOCUMENTS': return <DocumentsView />;
      case 'SETTINGS': return <SettingsView />;
      default: return <DashboardView {...viewProps} />;
    }
  }, [activeView, session, status]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Laddar...</div>;
  }
  if (status === 'unauthenticated') {
    redirect('/');
  }

  return (
      <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
        <Sidebar 
          activeView={activeView} 
          onNavClick={(view: View) => setActiveView(view)}
          onStartQuoteFlow={handleStartQuoteFlow} // Koppla till chat-flödet
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header-knappen kan nu växla chattens expanderade läge */}
          <Header onChatToggle={() => setIsChatExpanded(!isChatExpanded)} />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {CurrentView}
          </main>
          
          {/* --- KORREKT CHATT-IMPLEMENTERING --- */}
          {/* Den riktiga chatt-komponenten är nu integrerad i layouten */}
          <Chat 
            isExpanded={isChatExpanded}
            setExpanded={setIsChatExpanded}
            startQuoteFlow={startChatQuoteFlow}
            onQuoteFlowComplete={() => setStartChatQuoteFlow(false)} // Återställ efter avslutat flöde
            startOnboardingFlow={startChatOnboarding}
            onOnboardingComplete={() => setStartChatOnboarding(false)} // Återställ efter avslutat flöde
          />
        </div>

        <NewProjectModal 
            isOpen={isNewProjectModalOpen} 
            onClose={() => setIsNewProjectModalOpen(false)} 
        />
      </div>
  );
}
