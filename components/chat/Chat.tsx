
'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PaperAirplaneIcon } from '@/heroicons/react/24/solid';

// =================================================================================
// CHAT-KOMPONENT (v1.0 - HJÄRTAT I SYSTEMET)
// Beskrivning: Hanterar all chattlogik med hjälp av Vercel AI SDK:s `useChat`-hook.
// Denna komponent är nu redo att kopplas in i `BottomChatPanel`.
// =================================================================================

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, data, setMessages } = useChat({
    // `data` innehåller extra info från servern, som `chatId`.
    onFinish: (message) => {
      // När ett svar är helt färdigstreamat, kan vi hämta chatId från serverns svar.
      if (data) {
        const { chatId } = data as { chatId: string };
        // TODO: Spara chatId i state för framtida meddelanden.
      }
    },
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scrolla automatiskt till botten när nya meddelanden dyker upp.
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-grow p-4 pt-0 flex flex-col min-h-0 h-full">
      {/* Meddelandehistorik */}
      <div ref={chatContainerRef} className="flex-grow bg-background-secondary rounded-md p-3 mb-4 overflow-y-auto">
        {messages.length > 0 ? (
          messages.map(m => (
            <div key={m.id} className="whitespace-pre-wrap py-2">
              <strong className={m.role === 'user' ? 'text-accent' : 'text-primary'}>
                {m.role === 'user' ? 'Du: ' : 'AI: '}
              </strong>
              {m.content}
            </div>
          ))
        ) : (
          <p className="text-sm text-text-secondary">Starta en konversation för att se din historik här.</p>
        )}
      </div>

      {/* Input-formulär */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-shrink-0">
        <Textarea 
          value={input}
          onChange={handleInputChange}
          placeholder="Ställ en fråga till ByggPilot AI..."
          className="flex-1 bg-background-primary border-border-secondary resize-none" 
          rows={1} 
        />
        <Button type="submit" className="bg-accent hover:bg-accent-dark aspect-square">
          <PaperAirplaneIcon className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
