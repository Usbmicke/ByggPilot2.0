
'use client';

import React, { useState } from 'react';
import Sidebar from '@/app/components/layout/Sidebar';
import Header from '@/app/components/layout/Header';
import { usePathname } from 'next/navigation';
import MessageInput from '@/app/components/MessageInput';

const MainAppLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Dölj huvudlayouten för vissa specifika sidor
  if (pathname === '/login' || pathname === '/register') {
    return <>{children}</>;
  }

  return (
    <div className="h-screen flex bg-background-primary">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col md:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 mt-16">
          {children}
        </main>

        {/* MessageInput har flyttats utanför den marginalsatta diven, men är kvar inom samma flex-kolumn för att hålla sig längst ner. */}
        <div className="p-4 border-t border-border-primary">
          <MessageInput />
        </div>
      </div>
    </div>
  );
};

export default MainAppLayout;
