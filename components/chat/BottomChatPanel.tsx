
'use client';

import React from 'react';
import { ChevronUpIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/button';
import Chat from './Chat'; // <-- IMPORTERAR DEN NYA KOMPONENTEN

// =================================================================================
// BOTTOM CHAT PANEL (v3.2 - "LIVE-KOPPLING")
// Beskrivning: Integrerar den fullt fungerande <Chat />-komponenten.
// v3.2:
//    - INTEGRATION: Byter ut den statiska platshållaren mot den nya, intelligenta
//      <Chat /> komponenten. Detta gör chatten fullt interaktiv.
// =================================================================================

interface BottomChatPanelProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const BottomChatPanel: React.FC<BottomChatPanelProps> = ({ isOpen, setIsOpen }) => {

  return (
    <div 
      className={`absolute bottom-4 left-4 right-4 md:left-[17rem] bg-component-background border border-border/80 rounded-xl shadow-2xl z-20 flex flex-col overflow-hidden transition-[max-height] duration-700 ease-in-out`}
      style={{
        maxHeight: isOpen ? 'calc(100vh - 5rem)' : '68px',
      }}
    >
      {/* ---- ALLTID SYNLIG HEADER ---- */}
      <div 
        className="flex items-center justify-between px-4 h-[68px] cursor-pointer flex-shrink-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-accent"/>
          <h3 className="font-semibold text-text-primary">AI Assistent</h3>
        </div>
        <Button variant="ghost" size="icon" className="text-text-secondary">
          <ChevronUpIcon 
            className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} 
          />
        </Button>
      </div>

      {/* ---- INTERAKTIVT CHATT-INNEHÅLL ---- */}
      <Chat />
      
    </div>
  );
};

export default BottomChatPanel;
