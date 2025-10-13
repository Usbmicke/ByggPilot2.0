
'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import GuidedTour from '@/components/tour/GuidedTour';
import ChatBanner from '@/components/layout/ChatBanner'; // <-- Importerad!

// =================================================================================
// DASHBOARD LAYOUT V1.3 - SLUTGILTIG CHAT-INTEGRATION
// REVIDERING:
// Den nya ChatBanner-komponenten är nu importerad och placerad i botten av
// <main>-elementet. Detta är den korrekta placeringen som säkerställer att
// chatten är en del av sidans scroll-flöde och fungerar som avsett.
// =================================================================================

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900 text-white">
        Laddar session...
      </div>
    );
  }

  if (status === 'unauthenticated') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="md:pl-64 flex flex-col flex-1">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 mt-[65px]">
            {children}
            <ChatBanner /> { /* <-- Korrekt placerad här */ }
        </main>
      </div>

      <GuidedTour />
    </div>
  );
}
