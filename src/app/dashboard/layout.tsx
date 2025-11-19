
import Sidebar from '@/app/_components/layout/Sidebar';
import Header from '@/app/_components/layout/Header';
import Chat from '@/app/_components/chat/Chat';
import React from 'react';

// =======================================================================
//  HUVUDLAYOUT FÖR HELA DASHBOARDEN
//  Struktur: [Fast Sidebar] [Flexibel Huvudyta]
//  Huvudytan innehåller: [Fast Header] [Scrollbart Innehåll] [Fast Chatt-bar]
// =======================================================================

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#111113] text-white">
      
      {/* ---- 1. FAST SIDOMENY (VÄNSTER) ---- */}
      <Sidebar />

      {/* ---- 2. FLEXIBEL HUVUDYTA (HÖGER) ---- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* ---- 2a. FAST HEADER ---- */}
        <Header />

        {/* ---- 2b. SCROLLBART HUVUDINNEHÅLL ---- */}
        {/* 'relative' är viktigt för att chatten ska kunna positionera sig korrekt */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          {children}
        </main>
        
        {/* ---- 2c. FAST CHATT-BAR ---- */}
        {/* Denna komponent kommer att byggas om helt härnäst */}
        <Chat />

      </div>
    </div>
  );
}
