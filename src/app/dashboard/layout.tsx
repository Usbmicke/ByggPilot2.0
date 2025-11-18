'use client';

import Header from "@/app/_components/layout/Header"; 
import Sidebar from "@/app/_components/layout/Sidebar";
import dynamic from 'next/dynamic';

const Chat = dynamic(() => import('@/app/_components/chat/Chat'), { ssr: false });

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col bg-background-primary text-text-primary">
      <Header /> 
      <div className="flex flex-1 overflow-hidden">
        <div className="w-72 flex-shrink-0 bg-background-secondary border-r border-border-color">
          <Sidebar />
        </div>

        <main className="flex-1 relative">
          <div className="h-full overflow-y-auto p-6 md:p-8">
            {children}
          </div>
          
          <Chat />
        </main>
      </div>
    </div>
  );
}
