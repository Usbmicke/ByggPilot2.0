'use client';

import { useChat } from '@ai-sdk/react';
import { logger } from '@/lib/logger';
import { useEffect } from 'react';
import { useSWRConfig } from 'swr'; // <-- STEG 1: Importera SWR-konfigurations-hooken

// =================================================================================
// CHAT COMPONENT V2.0 - Blueprint "Sektion 5.2": Sömlös UI-uppdatering
// =================================================================================
// Denna version integrerar med SWR för att automatiskt uppdatera andra delar av UI:t
// när en AI-aktion (som att skapa ett projekt) har slutförts.

export default function Chat() {
  const { mutate } = useSWRConfig(); // <-- STEG 2: Hämta mutate-funktionen

  const { messages, input, handleInputChange, handleSubmit, error, isLoading } = useChat({
    api: '/api/chat',
    onError: (err) => {
      logger.error('[useChat Hook]', err);
    },
    // STEG 3: Använd onFinish-callbacken som körs när AI:n är klar
    onFinish: (message) => {
      logger.info('[onFinish] AI response finished.', { message });

      // STEG 4: Kontrollera om ett verktyg användes, specifikt 'createProject'
      if (message.toolInvocations && message.toolInvocations.some(tool => tool.toolName === 'createProject')) {
        logger.info('[onFinish] createProject tool was used. Triggering UI refresh for projects.');
        // STEG 5: Anropa mutate för att tvinga SWR att hämta om projektlistan
        mutate('/api/projects');
      }
    }
  });

  return (
    <div className="flex flex-col h-full max-h-screen bg-background-secondary border-l border-border-color">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length > 0
          ? messages.map(m => (
              <div key={m.id} className={`whitespace-pre-wrap flex flex-col items-${m.role === 'user' ? 'end' : 'start'}`}>
                <div className={`p-3 rounded-lg max-w-xl ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background-tertiary'}`}>
                    <span className="font-bold capitalize">{m.role === 'assistant' ? 'ByggPilot' : 'Du:'}</span>
                    <p>{m.content}</p>
                </div>
              </div>
            ))
          : (
            <div className="text-center text-text-secondary p-8">
                <h2 className="text-xl font-bold">ByggPilot Co-Pilot</h2>
                <p>Ställ en fråga eller ge ett kommando för att börja.</p>
            </div>
          )}
      </div>

      {error && (
        <div className="p-4 bg-red-500 text-white">
          <p>Ett fel uppstod: {error.message}</p>
        </div>
      )}

      <div className="p-4 border-t border-border-color">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            className="flex-1 p-2 rounded-md bg-background-tertiary border border-border-color focus:ring-2 focus:ring-primary focus:outline-none"
            value={input}
            placeholder={isLoading ? 'Tänker...' : 'Fråga ByggPilot något...'}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <button type="submit" className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold disabled:bg-gray-500" disabled={isLoading || !input}>
            Skicka
          </button>
        </form>
      </div>
    </div>
  );
}
