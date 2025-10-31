
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import { Chat } from '../components/chat/Chat';

// BORTTAGNA: UIProvider och ChatProvider. Dessa ska tillhandahållas av rot-layouten
// för att säkerställa att alla kontexter (inklusive ModalContext) är tillgängliga globalt.

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Ingen Provider-omslutning här. Layouten renderar endast sin struktur.
    <div className="h-screen flex flex-col bg-background-primary text-text-primary">
      
      <Header />

      <div className="flex flex-1 overflow-hidden">
        
        <div className="w-72 flex-shrink-0 bg-background-secondary border-r border-border-color">
          <Sidebar />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
            
            <main className="flex-1 overflow-y-auto p-6 md:p-8">
                {children}
            </main>
            
            <div className="flex-shrink-0 px-6 md:px-8 pb-4">
              <Chat />
            </div>
        </div>
      </div>
    </div>
  );
}
