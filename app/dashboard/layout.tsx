
import Header from "@/app/components/layout/Header";
import Sidebar from "@/app/components/layout/Sidebar";
// GULDSTANDARD-FIX: Importerar ModalRenderer korrekt som en default export.
import ModalRenderer from "@/app/components/layout/ModalRenderer";

// Denna layout appliceras på alla sidor under /dashboard/*
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col bg-background-primary text-text-primary overflow-hidden">
      {/* Global Modal Renderer för hela dashboarden */}
      <ModalRenderer />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar är permanent och synlig på alla dashboard-sidor */}
        <Sidebar />

        <main className="flex-1 flex flex-col overflow-y-auto">
          {/* Header som kan innehålla sökning, notiser och användarmeny */}
          <Header />
          
          {/* Här renderas den aktiva sidan (t.ex. dashboard/page.tsx) */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
