import { z } from 'zod';

export const createUserSchema = z
  .object({
    id: z.number(),
    email: z.string().email(),
    password: z.string(),
    name: z.string().optional(),
  })
  .omit({ id: true });

export type CreateUserDto = z.infer<typeof createUserSchema>;
