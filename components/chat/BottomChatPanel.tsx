
'use client';

import React, { useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

// =================================================================================
// BOTTOM CHAT PANEL (v1.0 - "OPERATION RÄTT CHATT")
// Beskrivning: En fristående, expanderbar chatt-panel som fäster i botten av 
// sitt förälderelement.
// =================================================================================

const BottomChatPanel = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Höjden på panelen när den är öppen eller stängd
  const closedHeight = '60px';
  const openHeight = '70%'; // Täcker 70% av förälderns höjd

  return (
    <div 
      className="absolute bottom-0 left-0 right-0 z-20 bg-component-background border-t border-border rounded-t-lg shadow-2xl transition-all duration-300 ease-in-out"
      style={{ height: isOpen ? openHeight : closedHeight }}
    >
      {/* ---- ALLTID SYNLIG HEADER ---- */}
      <div 
        className="flex items-center justify-between px-4 h-full cursor-pointer"
        style={{ height: closedHeight }} // Garanterar att headern har konstant höjd
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-semibold text-text-primary">AI Assistent</h3>
        <Button variant="ghost" size="icon" className="text-text-secondary">
          {isOpen ? <ChevronDownIcon className="h-5 w-5" /> : <ChevronUpIcon className="h-5 w-5" />}
        </Button>
      </div>

      {/* ---- EXPANDERBART INNEHÅLL (SYNLIGT NÄR ÖPPEN) ---- */}
      {isOpen && (
        <div className="absolute top-[60px] bottom-0 left-0 right-0 p-4 flex flex-col">
          {/* Meddelandehistorik (flex-grow för att ta upp plats) */}
          <div className="flex-grow bg-background-secondary rounded-md p-3 mb-4 overflow-y-auto">
            <p className="text-sm text-text-secondary">Starta en konversation för att se din historik här.</p>
            {/* Här kommer meddelandena att renderas i framtiden */}
          </div>

          {/* Input-fält (fast i botten av panelen) */}
          <div className="flex items-center gap-2">
            <Textarea 
              placeholder="Ställ en fråga till ByggPilot AI..."
              className="flex-1 bg-background-primary border-border-secondary resize-none"
              rows={1}
            />
            <Button className="bg-accent hover:bg-accent-dark">
              <PaperAirplaneIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BottomChatPanel;
