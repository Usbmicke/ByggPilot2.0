
import ChatPageClient from './page.client';

// =================================================================================
// NY CHATT-SIDA (Serverkomponent) (v3.0 - Platinum Standard)
//
// Beskrivning: Denna serverkomponent är extremt tunn. Dess enda ansvar
// är att rendera klientkomponenten som innehåller all interaktiv logik.
// All sessions- och datalogik hanteras nu i layouten och klient-hooken.
// =================================================================================

export default function NewChatPage() {
  return <ChatPageClient />;
}
