
'use client';

import React, { useState } from 'react';
import Sidebar from '@/app/components/layout/Sidebar';
import Header from '@/app/components/layout/Header';
import ChatWidget from '@/app/components/layout/ChatWidget';

export default function MainAppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-full bg-background-primary text-text-primary overflow-hidden">
      {/* Sidebar och Header är nu syskon, båda med fast positionering. */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* @ts-ignore */}
      <Header onMenuClick={() => setSidebarOpen(true)} />

      {/* Huvudinnehållet får en marginal på desktop för att inte hamna bakom sidomenyn
          och padding upptill för att inte hamna bakom headern. */}
      <div className="md:ml-64 pt-16 h-full">
        <main className="h-full overflow-y-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
      
      <ChatWidget />
    </div>
  );
}
