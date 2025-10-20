
'use server';

import * as dal from '@/lib/data-access';
import { logger } from '@/lib/logger';

export async function getChatHistory() {
    try {
        // The DAL function is already secure and session-verified
        const history = await dal.getConversationsForUser();
        return history;
    } catch (error) {
        logger.error({ message: '[Server Action] Failed to get chat history', error });
        // Return an empty array or a specific error object for the client to handle
        return [];
    }
}
