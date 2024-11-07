import { z } from 'zod';

export const createChannelSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    description: z.string().optional(),
    password: z.string(),
    Message: z.array(z.string()),
    Participant: z.array(z.string()),
  })
  .omit({ id: true });

export type CreateChannelDto = z.infer<typeof createChannelSchema>;
