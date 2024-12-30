import { z } from 'zod';

export const createChannelSchema = z
  .object({
    id: z.number(),
    name: z.string().min(1),
    description: z.string().optional(),
  })
  .omit({ id: true });

export type CreateChannelDto = z.infer<typeof createChannelSchema>;
