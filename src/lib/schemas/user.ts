
import { z } from 'zod';

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
