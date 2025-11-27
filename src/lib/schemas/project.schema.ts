import { z } from 'zod';

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerId: z.string(),
  description: z.string().optional(),
  createdAt: z.string().transform((str) => new Date(str)), // Håll datumen som strängar för serialisering
});

// Härled TypeScript-typen från schemat
export type Project = z.infer<typeof projectSchema>;
