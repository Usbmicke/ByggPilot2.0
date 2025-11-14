
import { z } from 'zod';

/**
 * =================================================================================
 * SCHEMAS (2025-11-12)
 * ---------------------------------------------------------------------------------
 * Detta är den enda källan till sanning för datastrukturer som delas mellan
 * frontend och backend. All validering sker via Zod-scheman.
 * Backend (Genkit) äger dessa definitioner.
 * =================================================================================
 */

/**
 * Representerar ett enskilt meddelande i en chattkonversation.
 * Används för att validera historiken som skickas till `chatOrchestratorFlow`.
 */
export const MessageData = z.object({
  role: z.enum(['user', 'model', 'system', 'tool']),
  content: z.string(),
});
