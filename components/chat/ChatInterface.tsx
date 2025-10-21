
'use client';

import { useChatLogic } from '@/hooks/use-chat';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { CoreMessage } from 'ai';

// =================================================================================
// CHAT-GRÄNSSNITT (v1.3 - Prop-förmedling)
//
// Beskrivning: Tar nu emot `onNewChat` och skickar den vidare till `useChatLogic`.
// =================================================================================

interface ChatInterfaceProps {
  chatId: string | null;
  initialMessages?: CoreMessage[];
  onNewChat: (chatId: string) => void; // TA EMOT FUNKTIONEN
}

export default function ChatInterface({ chatId, initialMessages, onNewChat }: ChatInterfaceProps) {
  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    isLoading 
  } = useChatLogic(chatId, { 
      initialMessages, 
      onNewChat // SKICKA VIDARE TILL HOOKEN
  });

  return (
    <div className="flex flex-col h-full bg-gray-800">
      <ChatMessages messages={messages} isLoading={isLoading} />
      <ChatInput 
        input={input} 
        handleInputChange={handleInputChange} 
        handleSubmit={handleSubmit} 
        isLoading={isLoading} 
      />
    </div>
  );
}
