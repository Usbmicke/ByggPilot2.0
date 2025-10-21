
'use client';

import { useChatLogic } from '@/hooks/use-chat';
import ChatInterface from './ChatInterface';

// =================================================================================
// CHATT-CONTAINER (v1.0 - Platinum Standard)
//
// Beskrivning: Denna komponent är en "container" eller "smart" komponent.
// Dess enda syfte är att husera chatt-logiken (via useChatLogic-hooken)
// och skicka ner den datan och de funktionerna som props till den "dumma"
// presentationskomponenten (ChatInterface).
// =================================================================================

interface ChatContainerProps {
  chatId: string | null;
  onNewChat: (newChatId: string) => void;
}

const ChatContainer = ({ chatId, onNewChat }: ChatContainerProps) => {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useChatLogic(chatId, { onNewChat });

  return (
    <ChatInterface
      messages={messages}
      input={input}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      isLoading={isLoading}
      chatId={chatId}
    />
  );
};

export default ChatContainer;

