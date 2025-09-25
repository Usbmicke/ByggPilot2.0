
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/app/components/layout/Sidebar';
import Header from '@/app/components/layout/Header';
import MessageInput from '@/app/components/MessageInput';

interface MainAppClientBoundaryProps {
  children: React.ReactNode;
  isNewUser: boolean;
}

const MainAppClientBoundary = ({ children, isNewUser }: MainAppClientBoundaryProps) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // === VAKTEN: Klient-sidans omdirigeringslogik ===
    if (isNewUser && pathname !== '/onboarding') {
      router.replace('/onboarding');
    }
  }, [isNewUser, pathname, router]);

  // Om vi håller på att omdirigera, visa en tom skärm för att undvika en flash av felaktigt innehåll.
  if (isNewUser && pathname !== '/onboarding') {
    return null; 
  }

  return (
    <div className="h-screen flex bg-background-primary">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col md:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 mt-16">
          {children}
        </main>

        <div className="p-4 border-t border-border-primary">
          <MessageInput />
        </div>
      </div>
    </div>
  );
};

export default MainAppClientBoundary;
