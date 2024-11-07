import { z } from 'zod';

export const createUserSchema = z
  .object({
    id: z.number(),
    email: z.string().email(),
    password: z.string(),
    name: z.string().optional(),
    nickname: z.string().optional(),
    active: z.boolean().optional(),
    roles: z.array(z.string()),
    message: z.array(z.string()),
    participant: z.array(z.string()),
  })
  .omit({ id: true });

export type CreateUserDto = z.infer<typeof createUserSchema>;
