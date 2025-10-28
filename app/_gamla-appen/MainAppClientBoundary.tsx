
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useChat } from '@/contexts/ChatContext';
import ChatWidget from '@/components/layout/ChatWidget';
import ModalRenderer from '@/components/layout/ModalRenderer'; // STEG 1: Importera ModalRenderer

interface MainAppClientBoundaryProps {
  children: React.ReactNode;
  isNewUser: boolean;
}

const MainAppClientBoundary = ({ children, isNewUser }: MainAppClientBoundaryProps) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { messages, sendMessage, isLoading, firebaseUser } = useChat();

  useEffect(() => {
    if (isNewUser && pathname !== '/onboarding') {
      router.replace('/onboarding');
    }
  }, [isNewUser, pathname, router]);

  if (isNewUser && pathname !== '/onboarding') {
    return null;
  }

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

        {/* STEG 2: Lägg till ModalRenderer här */}
        <ModalRenderer />

      </div>
    </div>
  );
};

export default MainAppClientBoundary;
