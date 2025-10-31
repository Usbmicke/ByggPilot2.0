import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import Chat from '../components/copilot/Chat'; // <-- STEG 1: Korrekt import-sökväg

// =================================================================================
// DASHBOARD LAYOUT V2.0 - Co-Pilot Integration
// =================================================================================
// Denna layout implementerar den primära visionen med en persistent Co-Pilot-chatt
// i en dedikerad kolumn bredvid huvud-innehållet.

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

        {/* -- Huvud-grid med innehåll och chatt -- */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 overflow-hidden">
          
          {/* -- Huvudinnehåll (Projekt, Kunder etc) -- */}
          <main className="lg:col-span-2 xl:col-span-3 overflow-y-auto p-6 md:p-8">
            {children}
          </main>
          
          {/* -- Co-Pilot Chatt-kolumn -- */}
          <div className="hidden lg:flex lg:col-span-1 xl:col-span-1 h-full">
            <Chat />
          </div>

        </div>
      </div>
    </div>
  );
}
