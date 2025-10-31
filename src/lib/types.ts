
import { z } from 'zod';

// =================================================================================
// CENTRALA DATATYPER (ZOD SCHEMAS) V1.0
// =================================================================================
// Detta är den enda källan till sanning för hur vår data ska se ut.
// All data som går in i eller ut ur databasen ska valideras mot dessa scheman.

// ---------------------------------------------------------------------------------
// Användarschema (motsvarar 'users'-collectionen i Firestore)
// ---------------------------------------------------------------------------------
export const UserSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email(),
  image: z.string().url().optional(),
  emailVerified: z.date().nullable().optional(),
  
  // Onboarding-specifika fält
  companyName: z.string().optional(),
  orgNumber: z.string().optional(),
  address: z.string().optional(),
  zipCode: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  
  // Google Drive-integration
  driveRootFolderId: z.string().optional(),
  driveRootFolderUrl: z.string().url().optional(),

  // Kritisk statusflagga
  hasCompletedOnboarding: z.boolean().default(false),
});

// Exporterar en TypeScript-typ för användning i frontend/backend-kod
export type User = z.infer<typeof UserSchema>;


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
