
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSession, SessionContextValue } from 'next-auth/react';
import { useChat as useAiChat, UseChatOptions } from 'ai/react';
import toast from 'react-hot-toast';

// =================================================================================
// GULDSTANDARD: CHAT CONTEXT v6.0
// BESKRIVNING: Denna fil är nu en tunn "wrapper" runt Vercel AI SDK:s `useChat`-hook.
// All manuell state-hantering, fetch-logik och streaming är borttagen.
// Den ansluter direkt till den nya, streamUI-kompatibla `/api/chat`-endpointen.
// =================================================================================

// Typdefinition för de props som vår hook kommer att returnera.
// Notera att vi lägger till `session` och byter namn på vissa funktioner för att
// bibehålla kompatibilitet med komponenterna som använder denna kontext.
interface ChatContextType extends Omit<ReturnType<typeof useAiChat>, 'append' | 'messages'> {
  messages: any[]; // ac-sdk returnerar en annan Message-typ, any tillåter flexibilitet.
  isLoading: boolean;
  session: SessionContextValue;
  sendMessage: (content: string, file?: File) => void; // Förenklad signatur
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const session = useSession();

  // Konfiguration för useChat-hooken.
  const chatOptions: UseChatOptions = {
    // Endpointen som hanterar streaming av text och UI-komponenter.
    api: '/api/chat',
    
    // Felhantering: Visa ett toast-meddelande om något går fel.
    onError: (error) => {
      console.error("Fel i AI-chatt:", error);
      toast.error(`Ett fel uppstod: ${error.message}`);
    },

    // Inledande meddelanden kan sättas här om så önskas.
    initialMessages: [
        {
            id: 'initial-welcome',
            role: 'assistant',
            content: 'Välkommen till ByggPilot! Hur kan jag assistera dig idag?'
        }
    ]
  };

  // Anropa den centrala Vercel AI SDK-hooken.
  const { 
    messages, 
    append, 
    reload, 
    stop, 
    isLoading, 
    input, 
    setInput 
  } = useAiChat(chatOptions);

  // Wrapper-funktion för att skicka meddelanden. `append` är SDK:ns funktion.
  // Vi ignorerar `file` för tillfället eftersom den nya arkitekturen inte hanterar det än.
  const sendMessage = (content: string, file?: File) => {
    if (file) {
      toast.error('Filuppladdning stöds inte i denna version.');
    }
    append({ role: 'user', content });
  };

  // Wrapper-funktion för att rensa chatten. Sätter meddelandena till en tom array.
  const clearChat = () => {
    // `useAiChat` har ingen inbyggd `clear`, så vi kan inte direkt rensa.
    // En framtida lösning skulle vara att hantera detta via state management.
    // För nu, meddelar vi användaren.
    toast('Funktionen \'Rensa chatt\' är inte fullt implementerad än.');
    // Om vi hade full kontroll: setMessages([]); 
  };

  // Sammanställ det värde som ska tillhandahållas av kontexten.
  const value: ChatContextType = {
    messages,
    isLoading,
    session,
    sendMessage,
    stop,
    clearChat,
    // Mappar om SDK:ns funktioner till de namn som förväntas av UI-komponenterna
    reload,
    input,
    setInput,
    handleInputChange: setInput, // Mappning för kompatibilitet
    handleSubmit: (e) => {
        e.preventDefault();
        if(input.trim()) {
            sendMessage(input);
            setInput('');
        }
    } 
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// Exportera hooken som komponenterna använder för att komma åt kontexten.
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat måste användas inom en ChatProvider');
  }
  return context;
};
