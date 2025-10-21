
'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import ChatInterface from './ChatInterface';

// =================================================================================
// FLYTANDE CHATT (v2.1 - Neutral Färg)
//
// Beskrivning: Den blå bakgrundsfärgen (`bg-sky-500`) har ersatts med en
//              neutral grå (`bg-component-background`) för att matcha det
//              nya, enhetliga färgschemat.
// =================================================================================

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);

  const handleSetChatId = (newChatId: string) => {
    setChatId(newChatId);
  };

  return (
    <>
      {/* Knappen för att öppna/stänga chatten */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          // ERSATT: bg-sky-500 med bg-component-background
          className="bg-component-background hover:bg-border text-text-primary rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-transform transform hover:scale-110"
          aria-label={isOpen ? 'Stäng chatt' : 'Öppna chatt'}
        >
          {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
        </button>
      </div>

      {/* Själva chattfönstret */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed bottom-28 right-8 w-[400px] h-[600px] bg-background-secondary/80 backdrop-blur-lg rounded-2xl shadow-2xl z-40 overflow-hidden border border-border"
          >
            <ChatInterface 
              chatId={chatId} 
              onNewChat={handleSetChatId} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
