
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import { Chat } from '../components/chat/Chat'; // <-- RÄTT IMPORT
import { UIProvider } from "../contexts/UIContext";
import { ChatProvider } from "../contexts/ChatContext"; // <-- RÄTT IMPORT

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UIProvider>
      <ChatProvider> { /* <-- OMSLUT MED CHATPROVIDER */ }
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
                
                {/* Byt ut den gamla komponenten mot den nya "hjärnan" */}
                <div className="flex-shrink-0 px-6 md:px-8 pb-4">
                  <Chat />
                </div>
            </div>
          </div>
        </div>
      </ChatProvider>
    </UIProvider>
  );
}
