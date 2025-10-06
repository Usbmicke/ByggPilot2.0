
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useChat } from '@/contexts/ChatContext';
import ChatWidget from '@/components/layout/ChatWidget';
import ModalRenderer from '@/components/layout/ModalRenderer';
import { useFirebaseSync } from '@/app/providers/AuthProvider'; // <--- IMPORTERA HOOKEN

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
  const { isFirebaseSynced } = useFirebaseSync(); // <--- HÄMTA SYNkroniseringsstatus

  useEffect(() => {
    // Omdirigera om användaren är ny och inte redan på onboarding.
    // Detta körs bara när klienten är redo.
    if (isNewUser && pathname !== '/onboarding') {
      router.replace('/onboarding');
    }
  }, [isNewUser, pathname, router]);

  // Om användaren är ny, rendera inget (omdirigering hanteras i useEffect).
  if (isNewUser) {
    return <FullscreenLoader />; // Visa laddare under omdirigering
  }

  // Om vi inte är synkade med Firebase än, visa laddningsskärmen.
  // Detta är den centrala lösningen för 401-felen.
  // Dashboarden renderas inte förrän detta villkor är falskt.
  if (!isFirebaseSynced) {
    return <FullscreenLoader />;
  }

  // När allt är klart: Rendera hela applikationen.
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
