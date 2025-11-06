
import { z } from 'zod';

// ---------------------------------------------------------------------------------
// Kontoschema (motsvarar 'accounts'-collectionen i Firestore)
// ---------------------------------------------------------------------------------
export const AccountSchema = z.object({
  userId: z.string(),
  type: z.string(),
  provider: z.string(),
  providerAccountId: z.string(),
  refresh_token: z.string().optional(),
  access_token: z.string().optional(),
  expires_at: z.number().optional(),
  token_type: z.string().optional(),
  scope: z.string().optional(),
  id_token: z.string().optional(),
  session_state: z.string().optional(),
});

// Exporterar en TypeScript-typ
export type Account = z.infer<typeof AccountSchema>;
