
'use client';

import ChatInterface from '@/components/chat/ChatInterface';
import { useChatLogic } from '@/hooks/use-chat';

// =================================================================================
// CHATT-SIDA (Klientkomponent) (v3.0 - Platinum Standard)
//
// Beskrivning: Denna klientkomponent är hjärtat i chattupplevelsen.
// Den använder vår nya `useChatLogic`-hook för att hantera all state och interaktion.
// Den skickar sedan ner datan till den "dumma" `ChatInterface`-komponenten.
// Detta är en ren och underhållbar separation av ansvar.
// =================================================================================

export default function ChatPageClient() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useChatLogic(); // Använder vår nya, centraliserade logik-hook

  return (
    <div className="flex-1 p-4 flex flex-col">
      <ChatInterface
        messages={messages}
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        chatId={null} // Ingen chatId för en ny chatt
      />
    </div>
  );
}
