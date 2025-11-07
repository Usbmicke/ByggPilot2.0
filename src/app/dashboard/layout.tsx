
'use client';

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Chat from '@/components/copilot/Chat';

// =================================================================================
// DASHBOARD LAYOUT V5.0 - Sista Åtgärden: Tvingad Om-rendering
// =================================================================================
// Genom att lägga till ett unikt `key`-attribut till Chat-komponenten tvingar vi
// React att totalt förstöra och återskapa komponenten vid varje rendering.
// Detta är en "brute force"-metod för att eliminera eventuella dolda tillstånds- 
// eller cachningsproblem som orsakar den envisa buggen.

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col bg-background-primary text-text-primary">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* -- Vänster sidomeny -- */}
        <div className="w-72 flex-shrink-0 bg-background-secondary border-r border-border-color">
          <Sidebar />
        </div>

        {/* -- Huvudinnehåll -- */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          {children}
        </main>
      </div>
      
      {/* -- Tvingar en ny instans av Chat-komponenten -- */}
      <Chat key={Math.random()} />
    </div>
  );
}
