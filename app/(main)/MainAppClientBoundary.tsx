
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ChatWidget from '@/components/layout/ChatWidget';
import ModalRenderer from '@/components/layout/ModalRenderer';
import { useCurrentUser } from '@/hooks/useCurrentUser';

// =================================================================================
// GULDSTANDARD V3.1 - KORREKT HANTERING AV SIDOEFFEKTER
// Omdirigeringslogiken är nu flyttad till en `useEffect`-hook för att förhindra
// renderings-loopar och "Cannot update a component while rendering"-felet.
// =================================================================================

const FullscreenLoader = ({ text }: { text: string }) => (
  <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
    <p className="text-white text-xl animate-pulse">{text}</p>
  </div>
);

const MainAppClientBoundary = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: userLoading, error: userError } = useCurrentUser();

  // **KORRIGERING: Hela routing-logiken är nu inkapslad i useEffect.**
  useEffect(() => {
    // Gör ingenting medan vi väntar på användardata.
    if (userLoading) return;

    // Om användaren inte finns (utloggad) eller om ett fel uppstod, skicka till login.
    if (userError || !user) {
      if (pathname !== '/') {
        router.replace('/');
      }
      return;
    }

    // KÄRNLOGIKEN: Om onboarding inte är klar OCH vi inte redan är där, omdirigera.
    if (!user.onboardingComplete && pathname !== '/onboarding') {
      router.replace('/onboarding');
    }

  }, [user, userLoading, userError, pathname, router]); // Körs när dessa värden ändras


  // ----- RENDERINGS-LOGIK -----
  // Bestämmer vad som ska VISAS baserat på nuvarande status.

  // 1. Visa laddare medan hooken jobbar.
  if (userLoading) {
    return <FullscreenLoader text="Verifierar användarstatus..." />;
  }
  
  // 2. Om användaren inte är klar med onboarding, visa en laddare under omdirigeringen.
  // Detta fångar upp den korta stunden *innan* useEffect har hunnit omdirigera.
  if (user && !user.onboardingComplete && pathname !== '/onboarding') {
      return <FullscreenLoader text="Omdirigerar till introduktion..." />;
  }

  // 3. Om ett fel uppstått (och vi inte redan omdirigerar till login)
  if (userError) {
      return <FullscreenLoader text="Anslutningsfel. Kontrollerar..." />;
  }

  // 4. Om ingen användare finns (och vi inte redan omdirigerar till login)
  if (!user) {
    return <FullscreenLoader text="Ingen session hittades. Omdirigerar..." />
  }

  // 5. Om allt är OK (användare finns & onboarding är klar), visa applikationen.
  return (
    <div className="h-screen flex bg-background-primary">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col md:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 flex flex-col overflow-y-auto mt-16">
          <div className="flex-1 p-4 md:p-6">
            {children}
          </div>
        </main>
        <ChatWidget />
        <ModalRenderer />
      </div>
    </div>
  );
};

export default MainAppClientBoundary;
