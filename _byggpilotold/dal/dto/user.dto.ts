import { z } from 'zod';

// Base schema for a user, used for validation and type safety.
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  createdAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

// Schema for creating a new user profile.
export const CreateUserProfileSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});
