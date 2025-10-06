
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useChat } from '@/contexts/ChatContext';
import ChatWidget from '@/components/layout/ChatWidget';
import ModalRenderer from '@/components/layout/ModalRenderer';
import { useFirebaseSync } from '@/providers/AuthProvider'; // <--- KORRIGERAD SÖKVÄG

interface MainAppClientBoundaryProps {
  children: React.ReactNode;
  isNewUser: boolean;
}

// En enkel laddningskomponent
const FullscreenLoader = () => (
  <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
    <p className="text-white text-xl">Ansluter...</p>
  </div>
);

const MainAppClientBoundary = ({ children, isNewUser }: MainAppClientBoundaryProps) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { syncStatus } = useFirebaseSync(); // Hämta den nya, robusta statusen

  useEffect(() => {
    if (isNewUser && pathname !== '/onboarding') {
      router.replace('/onboarding');
    }
  }, [isNewUser, pathname, router]);

  if (isNewUser) {
    return <FullscreenLoader />; // Visa laddare under omdirigering
  }

  // Visa laddningsskärmen tills synkroniseringen är klar eller misslyckad
  if (syncStatus === 'loading' || syncStatus === 'unauthenticated') {
    return <FullscreenLoader />;
  }

  // Hantera fel-state, om det skulle uppstå
  if (syncStatus === 'error') {
      return (
          <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
              <p className="text-white text-xl">Anslutningen misslyckades. Vänligen ladda om sidan.</p>
          </div>
      );
  }

  // När allt är klart (syncStatus === 'synced'): Rendera hela applikationen.
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
