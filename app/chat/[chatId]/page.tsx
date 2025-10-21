
import { getChatMessages } from '@/lib/data-access';
import ChatPageClient from './page.client';

// =================================================================================
// BEFINTLIG CHATT-SIDA (Serverkomponent) (v3.0 - Platinum Standard)
//
// Beskrivning: Denna serverkomponent ansvarar för att hämta den initiala
// chatt-historiken för en specifik chatt på ett säkert sätt.
// Den skickar sedan ner datan till klientkomponenten.
//
// Säkerhetsnotering: `getChatMessages` använder sessionen på serversidan
// för att verifiera att användaren äger chatten. `chatId` från URL:en är säker
// att använda här.
// =================================================================================

interface ChatPageProps {
  params: {
    chatId: string;
  };
}

export default async function ExistingChatPage({ params }: ChatPageProps) {
  const initialMessages = await getChatMessages(params.chatId);

  return <ChatPageClient chatId={params.chatId} initialMessages={initialMessages} />;
}
