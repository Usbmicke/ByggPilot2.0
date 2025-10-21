
'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import BottomChatPanel from '@/components/chat/BottomChatPanel';

// =================================================================================
// DASHBOARD LAYOUT (v8.0 - "OPERATION PREMIUM CHATT" STEG 2)
// Beskrivning: Den centrala layouten, nu med state-hantering för premium-chatten.
// v8.0:
//    - LYFT STATE: Äger nu `isChatOpen` state för att kunna orkestrera avancerade
//      interaktioner som t.ex. en fokus-overlay.
//    - PROP-DELNING: Skickar ner `isChatOpen` och `setIsChatOpen` till 
//      `BottomChatPanel` och en overlay-komponent.
// =================================================================================

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // LYFT STATE

  return (
    <div className="min-h-screen bg-background-primary text-white flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="md:pl-64 flex flex-col flex-1 relative">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        {/* ---- FOKUS-OVERLAY (syns bara när chatten är öppen) ---- */}
        {isChatOpen && (
          <div 
            onClick={() => setIsChatOpen(false)} 
            className="absolute inset-0 z-10 bg-black/50 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
          />
        )}

        <main className={`flex-1 p-4 sm:p-6 lg:p-8 mt-16`}>
            {children}
        </main>

        <BottomChatPanel 
          isOpen={isChatOpen} 
          setIsOpen={setIsChatOpen} 
        />
      </div>
    </div>
  );
}
