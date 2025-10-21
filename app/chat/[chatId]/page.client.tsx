
'use client';

import ChatInterface from '@/components/chat/ChatInterface';
import { useChatLogic } from '@/hooks/use-chat';
import type { CoreMessage } from 'ai';

// =================================================================================
// CHATT-SIDA (Klientkomponent) för befintlig chatt (v3.0 - Platinum Standard)
//
// Beskrivning: Denna klientkomponent är nästan identisk med den för nya chattar.
// Den enda skillnaden är att den tar emot `chatId` och `initialMessages` som props.
// Denna data används för att initiera `useChatLogic`-hooken, som sedan tar över.
// =================================================================================

interface ChatPageClientProps {
  chatId: string;
  initialMessages: CoreMessage[];
}

export default function ChatPageClient({ chatId, initialMessages }: ChatPageClientProps) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useChatLogic(chatId, { initialMessages }); // Initierar hooken med befintlig data

  return (
    <div className="flex-1 p-4 flex flex-col">
      <ChatInterface
        messages={messages}
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        chatId={chatId} // Skickar med chatId för kontext
      />
    </div>
  );
}

