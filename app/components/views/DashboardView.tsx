
'use client';
import React from 'react';
import { Session } from 'next-auth'; // Importera Session-typen
import { FolderPlusIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import ProjectCard from '@/app/components/dashboard/ProjectCard'; // Behåll befintliga komponenter
import RecentEventsWidget from '@/app/components/dashboard/RecentEventsWidget';
import TodoWidget from '@/app/components/dashboard/TodoWidget';
import { Project } from '@/app/types';

// Typ för props som komponenten tar emot
interface DashboardViewProps {
  session: Session | null; // Kan vara null om användaren inte är inloggad
  status: 'loading' | 'authenticated' | 'unauthenticated';
  onStartOnboarding: () => void;
}

// En ny komponent för det proaktiva onboarding-kortet
const OnboardingCard = ({ onStartOnboarding }: { onStartOnboarding: () => void }) => (
  <div className="bg-gradient-to-br from-cyan-600 to-blue-700 p-6 rounded-xl shadow-lg border border-cyan-500/50 flex flex-col items-center text-center">
    <FolderPlusIcon className="h-12 w-12 text-white/90 mb-3"/>
    <h3 className="text-xl font-bold text-white">Redo att organisera?</h3>
    <p className="text-white/80 mt-2 mb-4 text-sm max-w-sm">
      Låt ByggPilot skapa en standardiserad mappstruktur för nya projekt direkt i din Google Drive. 
      Detta inkluderar mappar för offerter, ritningar, avtal och foton.
    </p>
    <button 
      onClick={onStartOnboarding}
      className="bg-white text-cyan-700 font-semibold py-2 px-5 rounded-lg shadow hover:bg-gray-100 transition-transform transform hover:scale-105 flex items-center gap-2"
    >
      Konfigurera startpaket
      <ArrowRightIcon className="w-4 h-4" />
    </button>
  </div>
);

// Själva DashboardView-komponenten
const DashboardView: React.FC<DashboardViewProps> = ({ session, status, onStartOnboarding }) => {
  
  // Dummy-data för projektkortet, kan ersättas med riktig data senare
  const dummyProjects: Project[] = []; // Tom för nu

  if (status === 'loading') {
    return (
        <div className="w-full h-64 bg-gray-800/50 rounded-xl animate-pulse flex items-center justify-center">
            <p className="text-gray-400">Laddar din arbetsyta...</p>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Vänstra kolumnen */}
      <div className="lg:col-span-2 space-y-8">
        {status === 'authenticated' && (
          <OnboardingCard onStartOnboarding={onStartOnboarding} />
        )}

        <div>
          <h2 className="text-3xl font-bold text-white mb-6">Mina Projekt</h2>
          {dummyProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dummyProjects.map(project => (
                <ProjectCard key={project.id} project={project} showWeather={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-6 bg-gray-800/50 border border-gray-700 rounded-xl">
              <h3 className="text-xl font-bold text-white">Välkommen till ByggPilot!</h3>
              {status === 'authenticated' ? (
                <p className="text-gray-400 mt-2">Du har inga aktiva projekt just nu. Starta ett nytt via chatten!</p>
              ) : (
                <p className="text-gray-400 mt-2">Logga in med Google för att komma igång och hantera dina projekt.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Högra kolumnen */}
      <div className="lg:col-span-1 space-y-8">
        <RecentEventsWidget />
        <TodoWidget />
      </div>
    </div>
  );
};

export default DashboardView;
