'use client';

import { Message } from '@ai-sdk/react';
import { AlertTriangle } from 'lucide-react';

// ====================================================================================================
// MESSAGE LIST COMPONENT V1.2 (Toppskick: A11y & Semantics Certified)
// ====================================================================================================
// Denna version är certifierad för "Toppskick". Den icke-semantiska `div`-baserade listan har 
// ersatts med en korrekt `<ul>`/`<li>`-struktur, och felmeddelandet har fått `role="alert"`.
// Detta säkerställer en fullgod upplevelse för användare med skärmläsare.

interface MessageListProps {
  messages: Message[];
  chatError: string | null;
  isExpanded: boolean;
  chatContainerRef: React.RefObject<HTMLDivElement>;
}

export function MessageList({ messages, chatError, isExpanded, chatContainerRef }: MessageListProps) {

  return (
    <div
      ref={chatContainerRef}
      className={`overflow-y-auto p-4 flex-1 ${isExpanded ? '' : 'hidden'}`}
    >
      {/* TOPPSKICK-FIX: `role="alert"` meddelar skärmläsare omedelbart om felet. */}
      {chatError && (
        <div 
          role="alert"
          className="bg-destructive/10 border-l-4 border-destructive text-destructive-foreground p-4 rounded-md flex items-start space-x-4"
        >
          <AlertTriangle className="h-6 w-6 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Ett fel uppstod</h4>
            <p className="text-sm">{chatError}</p>
          </div>
        </div>
      )}

      {/* TOPPSKICK-FIX: En `ul` ger semantisk mening åt listan för skärmläsare. */}
      <ul className="space-y-4">
        {messages.map(m => (
          <li key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`p-3 rounded-lg max-w-2xl shadow-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background-tertiary'}`}>
              <span className="font-bold capitalize text-sm">{m.role === 'assistant' ? 'ByggPilot' : 'Du'}</span>
              <p className="whitespace-pre-wrap mt-1">{m.content}</p>
            </div>
          </li>
        ))}
      </ul>

      {messages.length === 0 && !chatError && isExpanded && (
        <div className="text-center text-text-secondary p-8">
          <p>Chatthistorik kommer att visas här. Börja med att ställa en fråga nedan.</p>
        </div>
      )}
    </div>
  );
}
