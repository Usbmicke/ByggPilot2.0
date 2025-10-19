
'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import GuidedTour from '@/components/tour/GuidedTour';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // All session-based redirection logic has been removed from this component.
  // The middleware (`middleware.ts`) is now the single source of truth for routing,
  // ensuring this layout only renders for authenticated and onboarded users.

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="md:pl-64 flex flex-col flex-1">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 mt-[65px]">
            {children}
        </main>
      </div>

      <GuidedTour />
    </div>
  );
}
