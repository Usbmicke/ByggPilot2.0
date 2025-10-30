
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import { ChatCoPilot } from '../components/chat/ChatCoPilot';
import { UIProvider } from "../contexts/UIContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UIProvider>
      <div className="h-screen flex bg-background-primary text-text-primary">
        {/* Sidofältet: All positionering och bredd styrs härifrån */}
        <div className="w-72 flex-shrink-0">
          <Sidebar />
        </div>

        {/* Huvudområde */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          
          {/* Header som ligger överst */}
          <Header />

          {/* Innehåll och Chatt-container. `relative` är nyckeln för att chatten ska fungera. */}
          <div className="flex-1 relative">
            <main className="absolute inset-0 overflow-y-auto p-6 md:p-8">
              {children}
            </main>
            
            {/* Chatten positioneras `absolute` inuti denna container */}
            <ChatCoPilot />
          </div>

        </div>
      </div>
    </UIProvider>
  );
}
