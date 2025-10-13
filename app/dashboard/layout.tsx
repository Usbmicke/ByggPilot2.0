
'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

// =================================================================================
// DASHBOARD LAYOUT V1.0 - GRUNDSTRUKTUR
// REVIDERING:
// Skapar den grundläggande layouten för hela dashboard-vyn. Denna fil är
// den centrala "ritningen" som sveper in alla sidor under /dashboard.
// 1. Importerar och renderar Sidebar och Header.
// 2. Hanterar state för att öppna/stänga sidomenyn på mobila enheter.
// 3. Skyddar vyn och omdirigerar oinloggade användare.
// 4. Skapar en huvud-container med korrekt padding och positionering för 
//    att innehållet (children) ska hamna rätt.
// =================================================================================

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session, status } = useSession();

  // Skydda routen medan sessionen laddas eller om den är ogiltig
  if (status === 'loading') {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900 text-white">
        Laddar session...
      </div>
    );
  }

  if (status === 'unauthenticated') {
    redirect('/'); // Skicka till landningssidan om inte inloggad
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="md:pl-64 flex flex-col flex-1">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 mt-[65px]">
            {children}
        </main>
      </div>
    </div>
  );
}
