import { z } from 'zod';

export const ProjectSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  name: z.string().min(3, { message: 'Project name must be at least 3 characters long' }),
  address: z.string().optional(),
  status: z.enum(['active', 'completed', 'on-hold']).default('active'),
  createdAt: z.date(),
});

export const CreateProjectSchema = ProjectSchema.omit({ id: true, createdAt: true });

export type Project = z.infer<typeof ProjectSchema>;
