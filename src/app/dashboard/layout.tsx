
'use client';

import DashboardHeader from "@/components/layout/DashboardHeader"; // ÄNDRAD
import Sidebar from "@/components/layout/Sidebar";
import dynamic from 'next/dynamic';

// =================================================================================
// DASHBOARD LAYOUT V12.0 - CHATTEN ÅTERINkopplad
// =================================================================================

// Importerar den nya, stabila chatt-komponenten. 
// `ssr: false` är viktigt eftersom den använder hooks som `useState` som bara körs på klienten.
const Chat = dynamic(() => import('@/components/chat/Chat'), { ssr: false });

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col bg-background-primary text-text-primary">
      <DashboardHeader /> {/* ÄNDRAD */}
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
          
          {/* Chatten är nu återinkopplad och kommer att "flyta" ovanpå huvudinnehållet */}
          <Chat />
        </main>
      </div>
    </div>
  );
}
