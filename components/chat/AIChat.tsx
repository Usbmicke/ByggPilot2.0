
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useChatLogic } from '@/hooks/use-chat';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { useState } from 'react';

// =================================================================================
// AI CHAT (v1.0 - "VÄRLDSKLASS")
// Beskrivning: En komplett, fullskärms-chattkomponent som ersätter all tidigare logik.
//              Byggd från grunden för att matcha målbilden och garantera funktion.
// v1.0:
//    - KORREKT LAYOUT: Input-fältet är nu permanent högst upp, historiken under.
//    - FUNGERANDE INPUT: Använder `useChatLogic` korrekt, vilket löser input-buggen.
//    - DESIGN: Implementerar den mörka, enhetliga designen från bilden.
//    - CENTRERAD LOGIK: Hanterar all chatt-state (meddelanden, laddning etc.)
// =================================================================================

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChat({ isOpen, onClose }: AIChatProps) {
  const [chatId, setChatId] = useState<string | null>(null);
  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    isLoading,
    reload,
    stop,
  } = useChatLogic(chatId, { onNewChat: setChatId });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: '100vh' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100vh' }}
          transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
          className="fixed inset-0 z-50 bg-[#171719] flex flex-col"
        >
          {/* ---- Header med Stäng-knapp ---- */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">ByggPilot AI</h2>
            <button 
              onClick={onClose}
              className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* ---- Input-fält (alltid överst) ---- */}
          <div className="flex-shrink-0 p-4 bg-transparent">
            <ChatInput
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>

          {/* ---- Chatthistorik (tar upp resterande utrymme) ---- */}
          <div className="flex-grow overflow-y-auto">
            <ChatMessages messages={messages} isLoading={isLoading} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
