import { z } from 'zod';

export const createUserSchema = z
  .object({
    id: z.number(),
    email: z.string().email(),
    password: z.string(),
    name: z.string().optional(),
    nickname: z.string().optional(),
    active: z.boolean().optional(),
    roles: z.array(z.string()).optional(),
    message: z.array(z.string()).optional(),
    participant: z.array(z.string()).optional(),
  })
  .omit({ id: true });

export type CreateUserDto = z.infer<typeof createUserSchema>;
