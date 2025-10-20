'use client';

import { useQuery } from '@tanstack/react-query';
import { getChatHistory } from '@/app/actions/chatActions';
import type { Chat } from '@/types';
import { logger } from '@/lib/logger';

// =================================================================================
// HOOK: useConversations V2 - SERVER ACTION
//
// Beskrivning: Denna hook använder @tanstack/react-query för att hämta en
// lista över den inloggade användarens konversationer via en Server Action.
// Detta eliminerar behovet av en dedikerad API-route.
// =================================================================================

export const useConversations = () => {
    return useQuery<Chat[], Error>({
        queryKey: ['conversations'], // Unik nyckel för denna query
        queryFn: async () => {
            try {
                // Anropar server action direkt. Inget behov av axios/fetch.
                const history = await getChatHistory();
                return history;
            } catch (error) {
                logger.error({ message: '[useConversations] Fel vid anrop av getChatHistory server action', error });
                throw new Error('Kunde inte hämta konversationer.'); // Kastas vidare till react-query
            }
        },
        
        // Konfigurationsalternativ för queryn
        staleTime: 5 * 60 * 1000, // 5 minuter
        cacheTime: 10 * 60 * 1000, // 10 minuter
        refetchOnWindowFocus: true,
    });
};
