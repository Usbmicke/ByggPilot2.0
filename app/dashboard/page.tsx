'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DashboardView from '@/app/components/views/DashboardView';
import ZeroState from '@/app/components/dashboard/ZeroState';
import { Project } from '@/app/types';

// Denna komponent blir nu huvudkontrollern för dashboarden.
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulera hämtning av projekt. I en riktig applikation
    // skulle detta vara ett API-anrop till Firestore baserat på användar-ID.
    const fetchProjects = async () => {
      if (status === 'authenticated') {
        console.log("Simulerar projekt-hämtning för användare:", session?.user?.id);
        // HÅRDKODAT: Sätt till en tom array för att tvinga ZeroState.
        // Ändra detta till en icke-tom array för att testa DashboardView.
        const fetchedProjects: Project[] = []; 
        setProjects(fetchedProjects);
      }
      setIsLoading(false);
    };

    fetchProjects();
  }, [session, status]);

  // Medan session och data laddas, visa en Platshållare
  if (status === 'loading' || isLoading) {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
            <div className="h-8 w-1/3 bg-gray-700 rounded mb-8"></div>
            <div className="h-64 bg-gray-800/50 rounded-xl border border-dashed border-gray-600"></div>
        </div>
    );
  }

  // Om användaren inte är inloggad
  if (status === 'unauthenticated') {
      return <p className="text-center text-red-400 p-8">Du måste vara inloggad för att se denna sida.</p>;
  }

  // Huvudlogiken: Visa ZeroState om inga projekt finns, annars DashboardView
  const hasProjects = projects.length > 0;
  const username = session?.user?.name || 'Användare';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {hasProjects ? (
        <DashboardView username={username} />
      ) : (
        <ZeroState /> // Nu utan den borttagna prop:en
      )}
    </div>
  );
}
