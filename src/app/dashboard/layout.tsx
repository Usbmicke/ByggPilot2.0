import Header from "@/app/components/layout/Header";
import Sidebar from "@/app/components/layout/Sidebar";
import Chat from '@/app/components/copilot/Chat';

// =================================================================================
// DASHBOARD LAYOUT V3.1 - Korrigerade Sökvägar
// =================================================================================
// Denna version rättar de felaktiga relativa sökvägarna från V3.0 till att
// använda absoluta sökvägar (@/), vilket löser "Module not found"-felet.

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

        {/* -- Huvudinnehåll (tar nu upp hela resterande ytan) -- */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          {children}
        </main>
      </div>
      
      {/* -- NY, FLYTANDE CO-PILOT KOMPONENT -- */}
      <Chat />
    </div>
  );
}
