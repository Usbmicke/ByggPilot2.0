
'use client';

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import dynamic from 'next/dynamic';

// =================================================================================
// DASHBOARD LAYOUT V11.0 - ARKITEKTUR FÖR "INRE SCROLL"
// =================================================================================

// BORTTAGET: Chat-komponenten är bortkopplad under ombyggnad.
// const Chat = dynamic(() => import('@/components/copilot/Chat'), { ssr: false });

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

        {/* Huvud-ramen: Icke-scrollande, agerar positionerings-kontext */}
        <main className="flex-1 relative">
          {/* Inre scroll-container: Har padding och är den enda scrollande delen */}
          <div className="h-full overflow-y-auto p-6 md:p-8">
            {children}
          </div>
          
          {/* BORTTAGET: Chatten är bortkopplad under ombyggnad. */}
          {/* <Chat /> */}
        </main>
      </div>
    </div>
  );
}
