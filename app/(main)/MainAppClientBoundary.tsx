'use client';

import React, { useState } from 'react';
import Sidebar from '@/app/components/layout/Sidebar';
import Header from '@/app/components/layout/Header';
import MessageInput from '@/app/components/MessageInput';

const MainAppClientBoundary = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

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