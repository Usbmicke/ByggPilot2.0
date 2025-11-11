
import { z } from 'zod';

// =================================================================================
// GRUNDLÄGGANDE IDENTIFIERARE
// =================================================================================

export const UserIdSchema = z.string().min(1, { message: 'Användar-ID får inte vara tomt' });
export const ProjectIdSchema = z.string().min(1, { message: 'Projekt-ID får inte vara tomt' });
export const AtaIdSchema = z.string().min(1, { message: 'ÄTA-ID får inte vara tomt' });
export const QuoteIdSchema = z.string().min(1, { message: 'Offert-ID får inte vara tomt' });

// =================================================================================
// ANVÄNDARPROFIL (UserProfile)
// =================================================================================

export const UserProfileSchema = z.object({
  userId: UserIdSchema,
  email: z.string().email({ message: 'Ogiltig e-postadress' }),
  companyName: z.string().optional(),
  onboardingComplete: z.boolean().default(false),
  driveRootFolderId: z.string().optional(),
  driveRootFolderUrl: z.string().optional(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

// =================================================================================
// PROJEKT (Project)
// =================================================================================

export const ProjectSchema = z.object({
  projectId: ProjectIdSchema,
  userId: UserIdSchema,
  name: z.string().min(2, { message: 'Projektnamn måste vara minst 2 tecken' }),
  description: z.string().optional(),
  createdAt: z.any().optional(),
});
export type Project = z.infer<typeof ProjectSchema>;

// =================================================================================
// ÄTA (Ändringar, Tillägg, Avgående)
// =================================================================================

export const AtaSchema = z.object({
  ataId: AtaIdSchema,
  projectId: ProjectIdSchema,
  userId: UserIdSchema,
  title: z.string().min(3, { message: 'Titel måste vara minst 3 tecken' }),
  description: z.string(),
  cost: z.number().positive({ message: 'Kostnaden måste vara ett positivt tal' }),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  createdAt: z.any().optional(),
});
export type Ata = z.infer<typeof AtaSchema>;

// Schema för att SKAPA en ÄTA. Innehåller bara fält som AI:n ska extrahera.
export const AtaCreationSchema = AtaSchema.pick({
  title: true,
  description: true,
  cost: true,
});
export type AtaCreationData = z.infer<typeof AtaCreationSchema>;


// =================================================================================
// OFFERT (Quote)
// =================================================================================

export const QuoteLineItemSchema = z.object({
  description: z.string(),
  quantity: z.number(),
  unit: z.string(),
  pricePerUnit: z.number(),
});

export const QuoteSchema = z.object({
  quoteId: QuoteIdSchema,
  projectId: ProjectIdSchema,
  userId: UserIdSchema,
  title: z.string().min(3, 'Offertens titel är för kort'),
  lineItems: z.array(QuoteLineItemSchema),
  totalCost: z.number(),
  validUntil: z.any().optional(),
  status: z.enum(['draft', 'sent', 'accepted', 'declined']).default('draft'),
  createdAt: z.any().optional(),
});
export type Quote = z.infer<typeof QuoteSchema>;

// =================================================================================
// GENKIT-FLÖDEN / CHAT
// =================================================================================

export const roleSchema = z.enum(['user', 'model', 'tool']);

export const MessageData = z.object({
    role: roleSchema,
    content: z.string(),
});
export type MessageData = z.infer<typeof MessageData>;
