
// import Header from "@/components/layout/Header"; // FAS 2 KORRIGERING
// import Sidebar from "@/components/layout/Sidebar"; // FAS 2 KORRIGERING
// import ModalRenderer from "@/components/layout/ModalRenderer"; // FAS 2 KORRIGERING
// import { ChatCoPilot } from '@/components/chat/ChatCoPilot'; // FAS 2 NYTT

// Denna layout appliceras på alla sidor under /dashboard/*
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col bg-background-primary text-text-primary overflow-hidden">
      {/* <ModalRenderer /> */}
      
      <div className="flex flex-1 overflow-hidden">
        {/* <Sidebar /> */}

        <main className="flex-1 flex flex-col overflow-y-auto">
          {/* <Header /> */}
          
          <div className="flex-1 p-4 sm:p-6 lg:p-8 relative"> {/* Position relative för att co-pilot ska kunna flyta över */} 
            {children}
          </div>
        </main>
      </div>

      {/* FAS 2: Integrera den nya, persistenta chatt-komponenten */}
      {/* <ChatCoPilot /> */}
    </div>
  );
}
