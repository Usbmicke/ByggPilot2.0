
import Sidebar from '@/app/_components/layout/Sidebar';
import DashboardHeader from '@/app/_components/layout/DashboardHeader';
import Chat from '@/app/_components/chat/Chat';
import React from 'react';
import { AuthProvider } from '@/app/_lib/context/AuthContext'; // IMPORTERA

// =======================================================================
//  HUVUDLAYOUT FÖR HELA DASHBOARDEN (VERSION 2 - MED AUTHPROVIDER)
// =======================================================================

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    // Omslut hela layouten med AuthProvider
    <AuthProvider>
      <div className="flex h-screen bg-[#111113] text-white">
        
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />

          <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
            {children}
          </main>
          
          <Chat />
        </div>
      </div>
    </AuthProvider>
  );
}
