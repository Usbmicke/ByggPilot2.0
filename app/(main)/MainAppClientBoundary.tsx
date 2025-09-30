
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/app/components/layout/Sidebar';
import Header from '@/app/components/layout/Header';
import { useChat } from '@/app/contexts/ChatContext';
import ChatInput from '@/app/components/chat/ChatInput';
import MessageFeed from '@/app/components/MessageFeed';

interface MainAppClientBoundaryProps {
  children: React.ReactNode;
  isNewUser: boolean;
}

const MainAppClientBoundary = ({ children, isNewUser }: MainAppClientBoundaryProps) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { messages, sendMessage, isLoading, firebaseUser } = useChat();

  useEffect(() => {
    if (isNewUser && pathname !== '/onboarding') {
      router.replace('/onboarding');
    }
  }, [isNewUser, pathname, router]);

  if (isNewUser && pathname !== '/onboarding') {
    return null;
  }
  
  const handleFocus = () => {
    // Logic to handle focus if needed, e.g., scroll to bottom
  };

  return (
    <div className="h-screen flex bg-background-primary">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col md:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 flex flex-col overflow-y-auto mt-16">
          {/* Main content from Next.js page */}
          <div className="flex-1 p-4 md:p-6">
            {children}
          </div>

          {/* Chat-specific content */}
          <div className="p-4 md:p-6">
              <MessageFeed messages={messages} />
          </div>
        </main>

        <div className="p-4 border-t border-border-primary">
          <ChatInput 
            onSendMessage={sendMessage}
            isChatDisabled={isLoading || !firebaseUser}
            onFocus={handleFocus}
          />
        </div>
      </div>
    </div>
  );
};

export default MainAppClientBoundary;
