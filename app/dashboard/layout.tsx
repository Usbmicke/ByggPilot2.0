
'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import GuidedTour from '@/components/tour/GuidedTour';
import FloatingChat from '@/components/chat/FloatingChat';

// =================================================================================
// DASHBOARD LAYOUT (v2.2 - BAKGRUNDSFIX)
// Beskrivning: Huvudlayout för dashboarden.
// v2.2: Bytt ut den hårdkodade `bg-gray-900` (som upplevs som blå) mot den
//       semantiska temafärgen `bg-background-primary`. Detta säkerställer
//       att bakgrunden respekterar temat i tailwind.config.ts och blir
//       genuint neutralgrå.
// =================================================================================

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    // FIX: Ersatt `bg-gray-900` med `bg-background-primary`
    <div className="min-h-screen bg-background-primary text-white">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="md:pl-64 flex flex-col flex-1">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 mt-16">
            {children}
        </main>

      </div>

      {/* ---- Persistent, Flytande Chatt ---- */}
      <FloatingChat />

      <GuidedTour />
    </div>
  );
}
