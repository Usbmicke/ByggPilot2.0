
import { getUserChats } from '@/lib/data-access';
import ChatHistoryClient from './ChatHistoryClient';

// =================================================================================
// CHAT HISTORY (Serverkomponent) (v1.0 - Platinum Standard)
//
// Beskrivning: Denna serverkomponent hämtar den fullständiga listan över
// användarens chattar på ett säkert sätt. Datan skickas sedan ner till
// en klientkomponent för rendering.
// =================================================================================

export default async function ChatHistory() {
    // Hämta chattar på serversidan för snabb och säker dataladdning.
    // Felhantering sker automatiskt i datalagret.
    const chats = await getUserChats();

    return <ChatHistoryClient chats={chats} />;
}
